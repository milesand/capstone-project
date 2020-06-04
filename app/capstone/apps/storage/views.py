import logging
import os
from pathlib import Path

from django.db.models import Q
from django.conf import settings
from django.db import transaction
from django.db.utils import IntegrityError
from django.shortcuts import get_object_or_404, Http404
from django_zip_stream.responses import TransferZipResponse
from moviepy.video.io.VideoFileClip import VideoFileClip
from PIL import Image, UnidentifiedImageError
from rest_framework import status, generics
from rest_framework.parsers import MultiPartParser, JSONParser
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Directory, File, UserStorage, PartialUpload
from .exceptions import NotEnoughCapacityException
from .serializers import FileSerializer, DirectorySerializer, PartialSerializer


logger = logging.getLogger(__name__)


# Boolean-y values. Copied from django rest framework's BooleanField.
TRUE_VALUES = {
    't', 'T',
    'y', 'Y', 'yes', 'YES',
    'true', 'True', 'TRUE',
    'on', 'On', 'ON',
    '1', 1, True,
}
FALSE_VALUES = {
    'f', 'F',
    'n', 'N', 'no', 'NO',
    'false', 'False', 'FALSE',
    'off', 'Off', 'OFF',
    '0', 0, 0.0, False,
}


def valid_dir_entry_name(name):
    return (
        len(name) in range(1, 257) and
        '/' not in name and
        name != '.' and
        name != '..'
    )


def perm_check_entry_with_teams(user, entry):
    '''
    Check whether given user has access to given entry, accounting for teams the
    user is in.
    The user has access if:
    1. the user owns the entry, or
    2. the user has access to the parent directory of this entry.

    Use this to check directory permission if you're treating the directory as an
    entry in some other shared directory.
    '''
    if entry.owner == user:
        return True
    return perm_check_dir_with_teams(user, entry.parent)


def perm_check_dir_with_teams(user, directory):
    '''
    Check whether given user has access to given directory, accounting for teams
    the user is in.
    Currently, manually traverses the directory upwards and checks for team stuff
    manually until a directory shared for this user is found or no parent exists.
    This means:
    1. for nested shared directories, the access permission is inherited:
       subdirectories can be made more open, but not more restrictive.
    2. THIS DESIGN IS NOT OPTIMIZED AT ALL: It does the job but it's potentially
       really slow. We access the DB at least once per parent directory traversed,
       and in case of really deep directory structure, this could be slow.
       TODO: benchmark this thing.
    3. If the user has access, they have COMPLETE access; they can upload to the
       directory, download files, delete anything in it, etc. No fine-grained
       access control.

    Use this to check directory permission if you're treating the directory itself
    as a shared directory.
    '''
    # Reverse relations to Team model defined in teams app used here.
    user_teams = user.teamList.all().only("pk").union(
        user.leader.all().only("pk")
    )
    while directory is not None:
        # Owner of a directory has access to ALL subdirectories, even to ones
        # owned by someone else. Suppose you own a directory and share it, and
        # someone else creates subdirectories in it. Later you stop sharing it,
        # but then you're stuck with someone else's files in your directory.
        # It'd be frustrating if you couldn't just remove it, no?
        if directory.owner == user:
            return True
        dir_teams = directory.team_set.all().only("pk")
        if user_teams.intersection(dir_teams).exists():
            return True
        directory = directory.parent
    return False


class FlowUploadStartView(APIView):
    parser_classes = (MultiPartParser, JSONParser)
    permission_classes = (IsAuthenticated,)

    def post(self, request):
        user = request.user

        # TODO: Move validation into a drf serializer

        # Get and validate fileSize.
        try:
            file_size = int(request.data['fileSize'])
        except KeyError:
            return Response(
                {"message": "Missing fileSize field"},
                status=status.HTTP_400_BAD_REQUEST,
            )
        if file_size < 0:
            return Response(
                {"message": "Invalid fileSize field: {}".format(request.data['fileSize'])},
                status=status.HTTP_400_BAD_REQUEST,
            )
        # Get and validate fileName.
        try:
            file_name = request.data['fileName']
        except KeyError:
            return Response(
                {"message": "Missing fileName field"},
                status=status.HTTP_400_BAD_REQUEST,
            )
        if not valid_dir_entry_name(file_name):
            return Response(
                {"message": "Invalid fileName field"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        directory = request.data.get('directory', '/')


        try:
            with transaction.atomic():
                try:
                    if directory.startswith('/'):
                        # Assume 'directory' is a POSIX path.
                        n, directory = Directory.get_by_path(user, directory)
                        if n != 0:
                            raise Directory.DoesNotExist
                    else:
                        # Assume 'directory' is a primary key.
                        directory = Directory.objects.get(pk=directory)
                        if not perm_check_dir_with_teams(user, directory):
                            raise Directory.DoesNotExist

                except Directory.DoesNotExist:
                    return Response(
                        {"message": "Directory not found"},
                        status=status.HTTP_400_BAD_REQUEST,
                    )

                upload = PartialUpload.objects.create(
                    size=file_size,
                    owner=user,
                    name=file_name,
                    parent=directory
                )
                storage = UserStorage.objects.filter(user=user).select_for_update().get()
                storage.add(file_size, file_count=1)
                storage.save()
        except IntegrityError:
            transaction.rollback()
            return Response(
                {"message": "Given name is already being used"},
                status=status.HTTP_400_BAD_REQUEST,
            )
        except NotEnoughCapacityException:
            transaction.rollback()
            return Response(
                {"message": "Not enough capacity"},
                status=status.HTTP_403_FORBIDDEN
            )

        return Response(
            {"Location": "http://localhost/api/upload/flow/" + str(upload.pk)}, # 테스트용, 꼭 지우기
            status=status.HTTP_201_CREATED,
            headers={
                "Location": "/api/upload/flow/" + str(upload.pk)
            }
        )


def _check_flow_upload_request(request, pk, attr, check_chunk, lock):
    '''
    Checks if there's an error with this flow storage request.
    If there's an error, returns `(True, error_response)`.
    If there isn't returns `(False, parsed_content)`.
    `parsed_content` is a 4-tuple of `(chunk_no, normal_chunk_size, chunk, partial_upload)`,
    `partial_upload` being database entry corresponding to this request.

    if check_chunk was False, then chunk data will not be checked and returned `chunk` will be None.
    if lock is True, returned partial_upload will be locked; Use this if you need to update and save
    the returned partial_upload.
    '''
    try:
        request_data = getattr(request, attr)
    except AttributeError:
        return (True, Response(status=status.HTTP_500_INTERNAL_SERVER_ERROR))

        # These are purely client-side error; no check against server-side data
        # happens here. 400 seems appropriate. Downside is that Flow doesn't interpret
        # 400 as "Stop trying to storage", and will try to keep uploading; Which means if
        # Flow breaks the request format, non-malicious clients using Flow could end up
        # trying to storage indefinitely with no success. We'll ignore this for now and
        # hope Flow doesn't break anything.
    try:
        chunk_no = int(request_data['flowChunkNumber'])
        # For last chunk, this isn't the same as current chunk size.
        # still useful for computing offset of this chunk.
        normal_chunk_size = int(request_data['flowChunkSize'])
        file_size = int(request_data['flowTotalSize'])
        if check_chunk:
            chunk = request_data['file']
            current_chunk_size = int(request_data['flowCurrentChunkSize'])
            if chunk.size != current_chunk_size:
                raise ValueError
        else:
            chunk = None
    except (KeyError, ValueError):
        return (True, Response(
            {"message": "Invalid request parameter"},
            status=status.HTTP_400_BAD_REQUEST
        ))

    # Get a PartialUpload by pk AND user. We don't want to leak the existence of
    # partial upload to someone who doesn't own it, so while 403 seems more appropriate
    # meaning-wise, We return 404 on both partial-upload-not-found and
    # owner-doesn't-match.
    # Note that we're not checking team permission here, since two different users
    # uploading to a same file simultaneously seems... weird.
    try:
        if lock:
            partial_upload = (
                PartialUpload.objects.filter(pk=pk, owner=request.user)
                .select_for_update().get()
            )
        else:
            partial_upload = PartialUpload.objects.get(pk=pk, owner=request.user)
    except PartialUpload.DoesNotExist:
        return (True, Response(
            {"message": "Upload not found"},
            status=status.HTTP_404_NOT_FOUND
        ))

    # We've established that the partial_upload's uploader and current user
    # matches, so it might be better to provide the user with more useful
    # responses other than 404.

    if partial_upload.is_expired():
        partial_upload.delete()
        # 410 GONE would be more appropriate, but flow doesn't understand it,
        # and Flow attempting to storage after expiration because bad internet
        # seems like a legit case. In this case we need to tell Flow to stop.
        return (True, Response(
            {"message": "Upload expired"},
            status=status.HTTP_404_NOT_FOUND
        ))

    if check_chunk:
        chunk_end = partial_upload.received_bytes + chunk.size
        if chunk_end > file_size:
            # User is attempting to store more than requested amount.
            return (True, Response(
                {"message": "File size exceeds requested amount"},
                status=status.HTTP_400_BAD_REQUEST
            ))

    return (False, (chunk_no, normal_chunk_size, chunk, partial_upload))


class FlowUploadChunkView(APIView):

    parser_classes = (MultiPartParser,)
    permission_classes = (IsAuthenticated,)


    def get(self, request, pk):
        err, payload = _check_flow_upload_request(
            request, pk, 'query_params', check_chunk=False, lock=False
        )
        if err:
            return payload

        chunk_no, normal_chunk_size, _, partial_upload = payload

        chunk_start = (chunk_no - 1) * normal_chunk_size
        if partial_upload.received_bytes > chunk_start:
            # We already received this chunk.
            # Return 200 OK to notify sending Flow client about this.
            return Response(status=status.HTTP_200_OK)

        # Flow interprets pretty much any HTTP status code outside of 200-202, 404, 415,
        # 500 and 501 as "Send this chunk again". So one needs to be picked.
        # Return 204 NO CONTENT since 1. The chunk actually isn't in the server, so 'no content'.
        # 2. This request was successfully processed and no content is being returned.
        return Response(status=status.HTTP_204_NO_CONTENT)


    def post(self, request, pk):
        with transaction.atomic():
            err, payload = _check_flow_upload_request(
                request, pk, 'data', check_chunk=True, lock=True
            )
            if err:
                return payload

            chunk_no, normal_chunk_size, chunk, partial_upload = payload
            chunk_start = (chunk_no - 1) * normal_chunk_size
            if partial_upload.received_bytes < chunk_start:
                # We're not ready to write this chunk yet, because we haven't written previous
                # chunks. Tell flow to send this again later.
                return Response(status=status.HTTP_204_NO_CONTENT)
            if partial_upload.received_bytes > chunk_start:
                # We already received this chunk, but for some reason flow sent it again.
                # This is fine, just 200.
                return Response(status=status.HTTP_200_OK)

            file_path = partial_upload.file_path()

            file_path.parent.mkdir(parents=True, exist_ok=True)
            file_path.touch(exist_ok=True)

            with file_path.open('ab') as partial_file:
                for subchunk in chunk.chunks():
                    partial_file.write(subchunk)
            partial_upload.received_bytes += chunk.size

            if partial_upload.received_bytes != partial_upload.size:
                partial_upload.save()
                return Response(status=status.HTTP_200_OK)

            file_record = partial_upload.complete()
            # Generate thumbnail.
            # May be a good idea to refactor this section into a function, but that's
            # not necessary right now and I'll leave it as a TODO.
            thumbnail_path = file_record.thumbnail_path()
            thumbnail_path.parent.mkdir(mode=0o755, parents=True, exist_ok=True)
            thumbnail_generated = False

            file_path = file_record.path()
            try:
                # Assume this is an image file and try to read it.
                with Image.open(file_path) as img:
                    img.thumbnail(settings.THUMBNAIL_SIZE)
                    img.save(thumbnail_path, format="PNG")
                thumbnail_generated = True
            except UnidentifiedImageError:
                pass

            if not thumbnail_generated:
                try:
                    # The file wasn't image; Try movie instead.
                    with VideoFileClip(str(file_path), audio=False) as clip:
                        # Pick an early frame, but not the initial one since those may
                        # be completely black in some cases. Note that these numbers
                        # were arbitrarily picked.
                        frame_time = min(clip.duration * 0.001, 10.0)
                        frame = clip.get_frame(frame_time)
                except IOError:
                    pass
                else:
                    # else block for try statement is executed when no exception was caught;
                    # This is a bit obscure, but does what I want here.
                    img = Image.fromarray(frame)
                    img.thumbnail(settings.THUMBNAIL_SIZE)
                    img.save(thumbnail_path, format="JPEG")
                    thumbnail_generated = True

            if thumbnail_generated:
                file_record.has_thumbnail = True
                file_record.save()

            return Response(
                {'id': str(file_record.pk)},
                status=status.HTTP_201_CREATED,
                headers={
                    "Location": "/api/file/" + str(file_record.pk)
                },
            )


class CreateDirectoryView(APIView):

    permission_classes = (IsAuthenticated,)

    def post(self, request):
        fields = {}
        for field in ('parent', 'name'):
            try:
                fields[field] = request.data[field]
            except KeyError:
                return Response(
                    {"message": "Missing field: {}".format(field)},
                    status=status.HTTP_400_BAD_REQUEST,
                )
        if not valid_dir_entry_name(fields['name']):
            return Response(
                {"message": "Invalid field: name"},
                status=status.HTTP_400_BAD_REQUEST,
            )
        n, parent = Directory.get_by_path_or_id(
            request.user, fields['parent'], match_user_on_id = False
        )
        if n != 0 or not perm_check_dir_with_teams(request.user, parent):
            return Response(
                {"message": "Parent directory does not exist"},
                status=status.HTTP_400_BAD_REQUEST,
            )
        try:
            with transaction.atomic():
                storage = (
                    UserStorage
                    .objects
                    .filter(user=request.user)
                    .select_for_update()
                    .get()
                )
                storage.add(0, dir_count=1)
                storage.save()
                directory_record = Directory.objects.create(
                    owner=request.user,
                    parent=parent,
                    name=fields['name'],
                )
        except NotEnoughCapacityException:
            transaction.rollback()
            return Response(
                {"message": "Not enough capacity"},
                status=status.HTTP_403_FORBIDDEN,
            )
        except IntegrityError:
            transaction.rollback()
            return Response(
                {"message": "Given name is already being used"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        return Response(
            {"Location": "/api/directory/" + str(directory_record.pk)}, #로컬 테스트용, 나중에 지우기
            status=status.HTTP_201_CREATED,
            headers={
                "Location": "/api/directory/" + str(directory_record.pk)
            }
        )


class DirectoryView(APIView):

    permission_classes = (IsAuthenticated,)

    def get(self, request, pk):
        # We take only id here for convinience. Might be better to support path, too.
        try:
            directory = (
                Directory.objects
                .filter(pk=pk)
                .prefetch_related('children')
                .get()
            )
            if not perm_check_dir_with_teams(request.user, directory):
                raise Directory.DoesNotExist
        except Directory.DoesNotExist:
            return Response(
                {"message": "Directory not found"},
                status=status.HTTP_404_NOT_FOUND,
            )
        data = DirectorySerializer(directory).data

        for field_name in ("subdirectories", "files", "partial_uploads"):
            data[field_name] = {}

        for child in directory.children.all():
            try:
                child_dir = child.directory

                data['subdirectories'][child_dir.name] = str(child_dir.pk)
                continue
            except Directory.DoesNotExist:
                pass
            try:
                child_file = child.file
                data['files'][child_file.name] = FileSerializer(child_file).data
                continue
            except File.DoesNotExist:
                pass
            try:
                child_pu = child.partialupload
                data['partial_uploads'][child_pu.name] = str(child_pu.pk)
                continue
            except PartialUpload.DoesNotExist:
                pass
            logger.warning(
                "Child of unknown type found during serialization: %s",
                str(child.pk)
            )

        return Response(
            data,
            status=status.HTTP_200_OK
        )


    def put(self, request, pk):
        data = request.data
        name = None
        favorite = None

        try:
            name = data["name"]
        except KeyError:
            pass
        else:
            if not valid_dir_entry_name(name):
                return Response(
                    {"message": "유효하지 않은 name 필드값입니다."},
                    status=status.HTTP_400_BAD_REQUEST,
                )
        
        try:
            favorite = data["favorite"]
        except KeyError:
            pass
        else:
            if favorite in TRUE_VALUES:
                favorite = True
            elif favorite in FALSE_VALUES:
                favorite = False
            else:
                return Response(
                    {"message": "유효하지 않은 favorite 필드값입니다."},
                    status=status.HTTP_400_BAD_REQUEST,
                )
        
        if name is None and favorite is None:
            return Response(
                {"message": "유효한 필드가 감지되지 않았습니다."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        directory = get_object_or_404(Directory, pk=pk)
        if not perm_check_entry_with_teams(request.user, directory):
            return Response(status=status.HTTP_404_NOT_FOUND)
        
        try:
            with transaction.atomic():
                if name is not None:
                    directory.name = name
                if favorite is not None:
                    if favorite:
                        request.user.favorites.add(directory)
                    else:
                        request.user.favorites.remove(directory)
                directory.save()
        except IntegrityError:
            transaction.rollback()
            return Response(
                {"message": "다른 디렉토리 혹은 파일과 이름이 중복됩니다. 다른 이름을 선택해주세요."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        return Response(status=status.HTTP_204_NO_CONTENT)
            

    def delete(self, request, pk):
        try:
            directory = Directory.objects.get(pk=pk)
            if not perm_check_entry_with_teams(request.user, directory):
                raise Directory.DoesNotExist
        except Directory.DoesNotExist:
            return Response(
                {"message": "Directory not found"},
                status=status.HTTP_404_NOT_FOUND,
            )
        if directory.parent is None:
            return Response(
                {"message": "Cannot delete root directory"},
                status=status.HTTP_403_FORBIDDEN,
            )
        directory.delete()

        return Response(
            status=status.HTTP_204_NO_CONTENT,
        )


class FavoriteView(APIView):

    permission_classes = (IsAuthenticated,)

    def get(self, request): 
        data = {"directories": {}, "files": {}}
        favorites = request.user.favorites.all()
        for fav in favorites:
            if not perm_check_entry_with_teams(request.user, fav):
                # It's possible for someone to favorite a shared file,
                # which then becomes inaccessible due to un-sharing.
                # To keep GET a safe method, we don't delete anything,
                # just continue. TODO: unfavorite stuff when they are unshared.
                continue
            try:
                directory = fav.Directory
                data["directories"][directory.name] = str(directory.pk)
                continue
            except Directory.DoesNotExist:
                pass
            try:
                file_record = fav.File
                data["files"][file_record.name] = FileSerializer(file_record).data
                continue
            except File.DoesNotExist:
                pass
        
        return Response(data, status=status.HTTP_200_OK)


class ThumbnailAPI(APIView):
    permission_classes = (IsAuthenticated,)

    def get(self, request, file_id):  # 특정 사용자의 고유 ID와 함께 파일 이름 전달
        user = request.user
        try:
            file_record = get_object_or_404(File, pk=file_id)
            if not perm_check_entry_with_teams(request.user, file_record):
                raise Http404
        except Http404:
            return Response(
                {"error": "파일을 찾지 못했습니다."},
                status=status.HTTP_404_NOT_FOUND
            )
        if not file_record.has_thumbnail:
            return Response(
                {"error": "썸네일을 찾지 못했습니다."},
                status=status.HTTP_404_NOT_FOUND
            )

        return Response(
            status=status.HTTP_200_OK,
            headers={
                'Content-Disposition': 'inline',
                 # Let nginx handle this
                'X-Accel-Redirect': '/media/thumbnail/{0}/{1}'.format(
                    str(user.pk), str(file_record.pk)
                )
            },
            content_type='image/jpeg',
        )

def file_download(data, user):
    print("file download method.")
    if len(data) == 1:  # 파일 1개
        try:
            file_record = get_object_or_404(File, pk=data[0])
            if not perm_check_entry_with_teams(user, file_record):
                raise Http404
        except Http404:
            return Response(
                {"error": "해당 파일 ID로 저장된 파일이 존재하지 않습니다."},
                status=status.HTTP_404_NOT_FOUND
            )
        response = Response()
        # 서버에 저장되어 있는 파일 경로를 Nginx에게 알려준다.
        print("download url : ", '/media/files/{0}/{1}'.format(
            str(user.pk), str(file_record.pk)))

        response['X-Accel-Redirect'] = '/media/files/{0}/{1}'.format(
            str(user.pk), str(file_record.pk)
        )
        return response
    else:  # 파일 여러개
        print("multi files.")
        files = []
        for file_id in data:
            try:
                file_record = get_object_or_404(File, pk=file_id)
                if not perm_check_entry_with_teams(user, file_record):
                    raise Http404
            except Http404:
                return Response(
                    {"error": "file {0} does not exist.".format(file_id)},
                    status=status.HTTP_404_NOT_FOUND
                )
            files.append((
                file_record.name,
                '/media/files/{0}/{1}'.format(str(user.pk), str(file_record.pk)),
                file_record.size
            ))

        print('files : ', files)
        return TransferZipResponse(filename='downloadFiles.zip', files=files)

class FileDownloadAPI(APIView): #파일 다운로드용 API
    permission_classes = (IsAuthenticated, )

    def post(self, request):
        return file_download(list(request.data.values()), request.user)

class StreamingAPI(APIView): # 동영상 스트리밍용 API
    def get(self, request, pk):
        return file_download([pk], request.user)

#파일 ID를 통해 파일 정보를 얻는다.
class FileManagementAPI(generics.GenericAPIView):
    serializer_class = FileSerializer

    def get(self, request, file_id):
        try:
            file_record = get_object_or_404(File, pk=file_id)
            if not perm_check_entry_with_teams(request.user, file_record):
                raise Http404
        except Http404:
            return Response(status=status.HTTP_400_BAD_REQUEST)

        serializer = self.serializer_class(file_record)
        return Response(serializer.data, status=status.HTTP_200_OK)


    def put(self, request, file_id):
        data = request.data
        name = None
        favorite = None

        try:
            name = data["name"]
        except KeyError:
            pass
        else:
            if not valid_dir_entry_name(name):
                return Response(
                    {"message": "유효하지 않은 name 필드값입니다."},
                    status=status.HTTP_400_BAD_REQUEST,
                )
        
        try:
            favorite = data["favorite"]
        except KeyError:
            pass
        else:
            if favorite in TRUE_VALUES:
                favorite = True
            elif favorite in FALSE_VALUES:
                favorite = False
            else:
                return Response(
                    {"message": "유효하지 않은 favorite 필드값입니다."},
                    status=status.HTTP_400_BAD_REQUEST,
                )
        
        if name is None and favorite is None:
            return Response(
                {"message": "유효한 필드가 감지되지 않았습니다."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        file_record = get_object_or_404(File, pk=file_id)
        if not perm_check_entry_with_teams(request.user, file_record):
            return Response(status=status.HTTP_404_NOT_FOUND)
        
        try:
            with transaction.atomic():
                if name is not None:
                    file_record.name = name
                if favorite is not None:
                    if favorite:
                        request.user.favorites.add(file_record)
                    else:
                        request.user.favorites.remove(file_record)
                file_record.save()
        except IntegrityError:
            transaction.rollback()
            return Response(
                {"message": "다른 디렉토리 혹은 파일과 이름이 중복됩니다. 다른 이름을 선택해주세요."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        return Response(status=status.HTTP_200_OK)


    def delete(self, request, file_id): # 파일 삭
        try:
            file_record = get_object_or_404(File, pk=file_id)
            if not perm_check_entry_with_teams(request.user, file_record):
                raise Http404
        except(Http404):
            return Response({'error' : '파일이 존재하지 않습니다.'}, status=status.HTTP_400_BAD_REQUEST)

        file_record.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

# 특정 사용자가 가지고 있는 파일들의 정보를 전부 출력한다.
class FileListAPI(generics.GenericAPIView):
    serializer_class = FileSerializer
    permission_classes = (IsAuthenticated, )

    def get(self, request):
        self.queryset = File.objects.filter(owner=request.user)
        print(self.queryset)
        serializer = self.serializer_class(self.queryset, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    # 테스트용
    def delete(self, request):
        self.queryset = File.objects.filter(owner=request.user)
        self.queryset.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

class PartialAPI(generics.GenericAPIView): # 테스트용, 삭제 안된 partial file 목록 출력.
    serializer_class = PartialSerializer
    permission_classes = (IsAuthenticated, )

    def get(self, request):
        self.queryset=PartialUpload.objects.filter(owner=request.user)
        print(self.queryset)
        serializer=self.serializer_class(self.queryset, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    # 테스트용
    def delete(self, request):
        self.queryset = PartialUpload.objects.filter(owner=request.user)
        self.queryset.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

class PartialDeleteAPI(APIView): # 특정 partial file 제거, 업로드 중단시에 사용

    def delete(self, request, pk):
        partial=get_object_or_404(PartialUpload, pk=pk)
        print("owner : ", partial.owner, ' user : ', request.user)
        if partial.owner!=request.user:
            return Response(status=status.HTTP_401_UNAUTHORIZED)

        partial.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
