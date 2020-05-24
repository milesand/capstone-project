import os
from pathlib import Path, PurePosixPath

from django.conf import settings
from django.db import transaction
from django.db.utils import IntegrityError
from django.shortcuts import get_object_or_404, Http404
from rest_framework import status, generics
from rest_framework.parsers import MultiPartParser, JSONParser
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Directory, File, UserStorage, PartialUpload
from .exceptions import NotEnoughCapacityException
from .serializers import FileSerializer, FileDownloadSerializer

# Thumbnail generation
from PIL import Image, UnidentifiedImageError
from moviepy.video.io.VideoFileClip import VideoFileClip

class FlowUploadStartView(APIView):
    parser_classes = (MultiPartParser, JSONParser)
    permission_classes = (IsAuthenticated,)

    def post(self, request):
        try:
            file_size = int(request.data['fileSize'])
            if file_size < 0:
                raise ValueError
        except (ValueError, KeyError):
            return Response(status=status.HTTP_400_BAD_REQUEST)

        user = request.user

        try:
            with transaction.atomic():
                storage = UserStorage.objects.filter(user=user).select_for_update().get()
                storage.add(file_size)
                storage.save()
                upload = PartialUpload.objects.create(file_size=file_size, uploader=user)
        except NotEnoughCapacityException:
            return Response(status=status.HTTP_403_FORBIDDEN)

        return Response(
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
        file_name = request_data['flowFilename']
        if len(file_name) == 0 or len(file_name) > 256:
            raise ValueError
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

    with transaction.atomic():
        try:
            if lock:
                partial_upload = PartialUpload.objects.filter(pk=pk).select_for_update().get()
            else:
                partial_upload = PartialUpload.objects.get(pk=pk)
        except PartialUpload.DoesNotExist:
            return (True, Response(
                {"message": "Upload not found"},
                status=status.HTTP_404_NOT_FOUND
            ))

        if partial_upload.uploader != request.user:
            # Technically it's not NOT FOUND; We found it, after all. So 403 may seem more appropriate.
            # But then we're leaking information to some potentially evil 3rd party
            # that partial upload with this pk exists. That seems bad for security.
            # So interpret this 404 not as NOT FOUND, but as MAYBE OR MAYBE NOT FOUND
            # BUT I AM NOT GOING TO TELL YOU AND I AM NOT LETTING YOU USE IT ANYWAYS.
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

        if len(partial_upload.file_name) == 0:
            partial_upload.file_name = file_name
            partial_upload.save()
        elif partial_upload.file_name != file_name:
            return (True, Response(
                {"message": "Filename does not match"},
                status=status.HTTP_400_BAD_REQUEST
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
        err, payload = _check_flow_upload_request(request, pk, 'query_params', check_chunk=False, lock=False)
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
            err, payload = _check_flow_upload_request(request, pk, 'data', check_chunk=True, lock=True)
            if err:
                return payload

            chunk_no, normal_chunk_size, chunk, partial_upload = payload
            chunk_start = (chunk_no - 1) * normal_chunk_size
            if partial_upload.received_bytes < chunk_start:
                # We're not ready to write this chunk yet, because we haven't written previous chunks.
                # Tell flow to send this again later.
                return Response(status=status.HTTP_204_NO_CONTENT)
            if partial_upload.received_bytes > chunk_start:
                # We already received this chunk, but for some reason flow sent it again.
                # This is fine, just 200.
                return Response(status=status.HTTP_200_OK)

            file_path = partial_upload.file_path()

            if os.path.dirname(os.getcwd()) != '/':  # on develop.
                file_path = Path(os.path.dirname(os.getcwd())+str(file_path))
            print('file path : ', file_path)
            file_path.parent.mkdir(parents=True, exist_ok=True)

            file_path.touch(exist_ok=True)

            with file_path.open('ab') as partial_file:
                for subchunk in chunk.chunks():
                    partial_file.write(subchunk)
            partial_upload.received_bytes += chunk.size

            if partial_upload.received_bytes != partial_upload.file_size:
                partial_upload.save()
                return Response(status=status.HTTP_200_OK)
            
            # TODO: update to support upload to non-root path.
            directory = UserStorage.objects.get(user=request.user).root_dir
            try:
                file_record = File.objects.create(
                    owner=request.user,
                    name=partial_upload.file_name,
                    size=partial_upload.file_size,
                    directory=directory,
                )
            except IntegrityError: #디렉토리 내부에 동일한 이름의 파일 존재 시 에러
                partial_upload.delete()
                return Response({'error' : '해당 디렉토리에 동일한 이름을 가진 파일이 존재합니다.'}, status=status.HTTP_400_BAD_REQUEST)

            directory.files.add(file_record)

            if os.path.dirname(os.getcwd()) == '/':  # on docker
                new_path = file_record.path()
            else:  # for test
                # IMO This should be removed and instead be set via setting COMPLETE_FILE_PATH.
                # BUT this is someone else's code and that someone else probably put this here for some reason,
                # so I'm just gonna make it slightly nicer to read.
                new_path = Path(os.path.dirname(os.getcwd()) + str(file_record.path()))

            new_path.parent.mkdir(parents=True, exist_ok=True)
            file_path.rename(new_path)

            partial_upload.is_complete = True
            partial_upload.delete()

            # Generate thumbnail.
            # May be a good idea to refactor this section into a function, but that's not necessary right now
            # and I'll leave it as a TODO.
            thumbnail_path = file_record.thumbnail_path()
            thumbnail_path.parent.mkdir(parents=True, exist_ok=True)
            thumbnail_generated = False
            try:
                # Assume this is an image file and try to read it.
                with Image.open(new_path) as img:
                    img.thumbnail(settings.THUMBNAIL_SIZE)
                    img.save(thumbnail_path, format="JPEG")
                thumbnail_generated = True
            except UnidentifiedImageError:
                pass

            if not thumbnail_generated:
                try:
                    # The file wasn't image; Try movie instead.
                    with VideoFileClip(str(new_path), audio=False) as clip:
                        # Pick an early frame, but not the initial one since those may be completely black
                        # in some cases. Note that these numbers were arbitrarily picked.
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
                {'id' : str(file_record.pk)},
                status=status.HTTP_201_CREATED,
                headers={
                    "Location": "/api/file/" + str(file_record.pk)
                },
            )


class ThumbnailAPI(APIView):
    permission_classes = (IsAuthenticated,)

    def get(self, request, file_id): # 특정 사용자의 고유 ID와 함께 파일 이름 전달
        user = request.user
        try:
            file = get_object_or_404(File, owner=user, pk=file_id)
        except Http404:
            return Response(
                {"error" : "파일을 찾지 못했습니다."},
                status=status.HTTP_404_NOT_FOUND
            )
        if not file.has_thumbnail:
            return Response(
                {"error" : "썸네일을 찾지 못했습니다."},
                status=status.HTTP_404_NOT_FOUND
            )
        
        return Response(
            status=status.HTTP_200_OK,
            headers={
                'Content-Disposition': 'inline',
                'X-Accel-Redirect': '/media/thumbnail/{0}/{1}'.format(str(user.pk), str(file.pk))
            },
            content_type='image/jpeg',
        )


class FileDownloadAPI(generics.GenericAPIView):
    serializer_class = FileDownloadSerializer
    permission_classes = (IsAuthenticated, )

    def get(self, request, file_id): # 특정 사용자의 고유 ID와 함께 파일 이름 전달
        user = request.user
        try:
            file = get_object_or_404(File, owner=user, pk=file_id)
        except Http404:
            return Response(
                {"error" : "해당 파일 이름으로 저장된 파일이 존재하지 않습니다."},
                status=status.HTTP_404_NOT_FOUND
            )

        response = Response()
        response['Content-Dispostion'] = 'attachment; filename={0}'.format(file.name) # 웹 페이지에 보여질 파일 이름을 결정한다.
        response['X-Accel-Redirect'] = '/media/files/{0}/{1}'.format(str(user.pk), str(file.pk))  # 서버에 저장되어 있는 파일 경로를 Nginx에게 알려준다.

        return response


#파일 ID를 통해 파일 정보를 얻는다.
class FileManagementAPI(generics.GenericAPIView):
    serializer_class = FileSerializer

    def get(self, request, file_id):
        try:
            file=get_object_or_404(File, owner=request.user, pk=file_id)
        except(Http404):
            return Response(status=status.HTTP_400_BAD_REQUEST)

        serializer=self.serializer_class(file)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def delete(self, request, file_id):
        try:
            file = get_object_or_404(File, owner=request.user, pk=file_id)
        except(Http404):
            return Response({'error' : '파일이 존재하지 않습니다.'}, status=status.HTTP_400_BAD_REQUEST)

        file.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

# 특정 사용자가 가지고 있는 파일들의 정보를 전부 출력한다.
class FileListAPI(generics.GenericAPIView):
    serializer_class = FileSerializer
    permission_classes = (IsAuthenticated, )

    def get(self, request):
        self.queryset=File.objects.filter(owner=request.user)
        print(self.queryset)
        serializer=self.serializer_class(self.queryset, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    # 테스트용
    def delete(self, request):
        self.queryset = File.objects.filter(owner=request.user)
        self.queryset.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)