from pathlib import Path, PurePosixPath
from django.conf import settings
from django.db import transaction
from django.shortcuts import get_object_or_404, Http404
from rest_framework import status, generics
from rest_framework.parsers import MultiPartParser, JSONParser
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Directory, File, UserStorage, PartialUpload
from .exceptions import NotEnoughCapacityException
from .serializers import FileSerializer, FileDownloadSerializer


#thumbnail
import os
BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from capstone.account.models import User
from .thumbnail import MakeImageThumbnail, MakeVideoThumbnail
from PIL import Image

from .serializers import FileDownloadSerializer

class FlowUploadStartView(APIView):
    parser_classes = (MultiPartParser, JSONParser)
    permission_classes = (IsAuthenticated,)

    def post(self, request):
        try:
            print('request : ', request.data)
            file_size = int(request.data['fileSize'])
            print('fileSize : ', file_size)
            if file_size < 0:
                raise ValueError
        except (ValueError, KeyError):
            return Response(status=status.HTTP_400_BAD_REQUEST)

        user = request.user
        storage = UserStorage.objects.filter(user=user)
        print(storage)
        if not storage:
            print("UserStoarge does NOT exist!!!!!!!")
            try:
                with transaction.atomic():
                    root = Directory.objects.create(
                        owner=user,
                        name="",
                        parent=None,
                    )
                    storage = UserStorage.objects.create(
                        user=user,
                        root_dir=root,
                    )
            except:
                pass
        else:
            print("UserStoarge exist!!!!!!!")
        try:
            with transaction.atomic():
                storage = UserStorage.objects.select_for_update().filter(user=user)
                print('storage : ', storage, ', storage type : ', type(storage))
                if not isinstance(storage, UserStorage):
                    print("not object, type : ", type(storage))
                    storage=storage[0]
                print("stoarge : ", storage)
                print("prev file num : ", storage.file_count)
                storage.add(file_size)
                storage.save()
                print("storage save complete.")
                print("current file num : ", storage.file_count)
        except NotEnoughCapacityException:
            return Response(status=status.HTTP_403_FORBIDDEN)


        upload = PartialUpload(file_size=file_size, uploader=user)
        upload.save()

        print('return!')
        return Response(
            {'Location': 'http://localhost/api/upload/flow/' + str(upload._id)},
            status=status.HTTP_201_CREATED,
            headers={
                "Location": "/api/upload/flow/" + str(upload._id)
            }
        )

        '''    try:
                storage = UserStorage.objects.select_for_update().get(user=user)
                print("UserStorage exist!!!!!!!!!!")
            except UserStorage.DoesNotExist:
                print("UserStoarge does NOT exist!!!!!!!")
                root = Directory.objects.create(
                    owner=user,
                    name="",
                    parent=None,
                )
                storage = UserStorage.objects.create(
                    user=user,
                    root_dir=root,
                )
            try:
                print("prev file num : ", storage.file_count)
                storage.add(file_size)
                print("current file num : ", storage.file_count)
            except NotEnoughCapacityException:
                return Response(status=status.HTTP_403_FORBIDDEN)
            storage.save()
            print("storage save complete.")

            upload = PartialUpload(file_size=file_size, uploader=user)
            upload.save()

        print('return!')
        return Response(
            {'Location' : 'http://localhost/api/upload/flow/' + str(upload._id)},
            status=status.HTTP_201_CREATED,
            headers={
                "Location": "/api/upload/flow/" + str(upload._id)
            }
        )'''

def _check_flow_upload_request(request, pk, attr, check_chunk):
    '''
    Checks if there's an error with this flow storage request.
    If there's an error, returns `(True, error_response)`.
    If there isn't returns `(False, parsed_content)`.
    `parsed_content` is a 4-tuple of `(chunk_no, normal_chunk_size, chunk, partial_upload)`,
    `partial_upload` being database entry corresponding to this request.

    if check_chunk was False, then chunk data will not be checked and returned `chunk` will be None.
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
        return (True, Response(status=status.HTTP_400_BAD_REQUEST))

    with transaction.atomic():
        print('pk : ', pk)
        partial_upload = get_object_or_404(PartialUpload, _id=pk)

        if partial_upload.uploader != request.user:
            # Technically it's not NOT FOUND; We found it, after all. So 403 may seem more appropriate.
            # But then we're leaking information to some potentially evil 3rd party
            # that partial upload with this pk exists. That seems bad for security.
            # So interpret this 404 not as NOT FOUND, but as MAYBE OR MAYBE NOT FOUND
            # BUT I AM NOT GOING TO TELL YOU AND I AM NOT LETTING YOU USE IT ANYWAYS.
            return (True, Response(status=status.HTTP_404_NOT_FOUND))

        # We've established that the partial_upload's uploader and current user
        # matches, so it might be better to provide the user with more useful
        # responses other than 404.

        if len(partial_upload.file_name) == 0:
            partial_upload.file_name = file_name
            partial_upload.save()
        elif partial_upload.file_name != file_name:
            return (True, Response(status=status.HTTP_400_BAD_REQUEST))

        if partial_upload.is_expired():
            partial_upload.delete()
            # 410 GONE would be more appropriate, but flow doesn't understand it,
            # and Flow attempting to storage after expiration because bad internet
            # seems like a legit case. In this case we need to tell Flow to stop.
            return (True, Response(status=status.HTTP_404_NOT_FOUND))

    if check_chunk:
        chunk_end = partial_upload.received_bytes + chunk.size
        if chunk_end > file_size:
            # User is attempting to storage more than requested amount.
            return (True, Response(status=status.HTTP_400_BAD_REQUEST))

    return (False, (chunk_no, normal_chunk_size, chunk, partial_upload))


class FlowUploadChunkView(APIView):

    parser_classes = (MultiPartParser,)
    permission_classes = (IsAuthenticated,)


    def get(self, request, pk):
        err, payload = _check_flow_upload_request(request, pk, 'query_params', check_chunk=False)
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
            err, payload = _check_flow_upload_request(request, pk, 'data', check_chunk=True)
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
                file_path=Path(os.path.dirname(os.getcwd())+str(file_path))

            print('file path : ', file_path)
            os.makedirs(os.path.dirname(file_path), exist_ok=True)
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
            file_record = File.objects.create(
                owner=request.user,
                name=partial_upload.file_name,
                size=partial_upload.file_size,
                directory=directory,
            )

            extension=os.path.splitext(file_record.name)[1]
            directory.files.add(file_record)
            if os.path.dirname(os.getcwd()) == '/':  # on docker
                new_path = Path(settings.COMPLETE_UPLOAD_PATH, str(request.user), str(file_record._id)+extension) # (수정) 경로에 사용자 아이디 추가.
                os.makedirs(os.path.dirname(new_path), exist_ok=True) # 사용자 디렉터리 없을 경우 새로 생성.

            else:  # for test
                new_path = os.path.dirname(os.getcwd()) + str(
                    Path(settings.COMPLETE_UPLOAD_PATH, str(request.user), str(file_record._id)+ extension))
                os.makedirs(os.path.dirname(new_path), exist_ok=True)

            print('new_path : ', new_path)
            file_path.rename(new_path)

            partial_upload.is_complete = True
            partial_upload.delete()

            # make thumbnail.

            extension=os.path.splitext(file_record.name)[1] # get file extension.
            save_name=str(file_record._id) + extension
            #setting file path.
            if os.path.dirname(os.getcwd()) == '/':  # on docker
                path = str(Path(settings.COMPLETE_UPLOAD_PATH, str(request.user), save_name))

            else:  # for test
                path = os.path.dirname(os.getcwd()) + str(
                    Path(settings.COMPLETE_UPLOAD_PATH, str(request.user), save_name))

            # check if uploaded file is image file.
            try:
                image = Image.open(path)
                image_thum = MakeImageThumbnail(path=path, width=50, height=50) # can set size of the thumbnail by changing the width value and height value.
                                                                                # initial values are width=50, height=50.

                thumbnail_url = image_thum.generate_thumbnail(request.user)
            except:
                print('이미지 파일 아님.')
                thumbnail_url='not image.'
                try:
                    print('동영상 파일임.')
                    video_thum = MakeVideoThumbnail(path, width=50, height=50) # can set size of the thumbnail by changing the width value and height value.
                                                                               # initial values are width=50, height=50.
                    thumbnail_url = video_thum.generate_thumbnail(request.user)
                except:
                    thumbnail_url='not image or video file.'

            return Response(
                {'thumbnail_url' : thumbnail_url,
                 'id' : str(file_record._id)}, # show thumbnail image's path to frontend.
                status=status.HTTP_201_CREATED,
                headers={
                    "Location": "/api/file" + str(file_record._id)
                },
            )


class FileDownloadAPI(generics.GenericAPIView):
    serializer_class = FileDownloadSerializer
    permission_classes = (IsAuthenticated, ) #추후에 권한 필요하도록 IsAuthenticated로 수정해야 함. 개발용 설정

    def get(self, request, file_id): #특정 사용자의 고유 ID와 함께 파일 이름 전달
        try:
            user=get_object_or_404(User, username=request.user.username) # 사용자 이름으로 받을까? 고유 ID로 받을까?
        except(Http404):
            return Response({"error": "사용자가 존재하지 않습니다."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            print(user)
            print(file_id)
            file=get_object_or_404(File, owner=user, pk=file_id)
        except(Http404):
            return Response({"error" : "해당 파일 이름으로 저장된 파일이 존재하지 않습니다."},
                                 status=status.HTTP_404_NOT_FOUND)

        response=Response()
        response['Content-Dispostion'] = 'attachment; filename={0}'.format(file.name) # 웹 페이지에 보여질 파일 이름을 결정한다.
        response['X-Accel-Redirect'] = '/media/files/{0}/{1}'.format(user.username, str(file._id) + os.path.splitext(file.name)[1]) # 서버에 저장되어 있는 파일 경로를 Nginx에게 알려준다.
                                                                                 # nginx 컨테이너 상에서 /media/files/<사용자 닉네임> 폴더에서 파일을 전달해준다.
        print('/media/files/{0}/{1}'.format(user.username, str(file._id) + os.path.splitext(file.name)[1]))
        return response

#파일 ID를 통해 파일 정보를 얻는다.
class FileInfoAPI(generics.GenericAPIView):
    serializer_class = FileSerializer

    def get(self, request, file_id):
        try:
            file=get_object_or_404(File, pk=file_id)
        except(Http404):
            return Response(status=status.HTTP_400_BAD_REQUEST)

        serializer=self.serializer_class(file)
        return Response(serializer.data, status=status.HTTP_200_OK)


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