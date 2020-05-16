from pathlib import Path, PurePosixPath

from django.conf import settings
from django.db import transaction
from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.parsers import MultiPartParser, JSONParser
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Directory, File, UserStorage, PartialUpload
from .exceptions import NotEnoughCapacityException

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
        with transaction.atomic():
            try:
                storage = UserStorage.objects.get(user=user)
            except UserStorage.DoesNotExist:
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
                storage.add(file_size)
            except NotEnoughCapacityException:
                return Response(status=status.HTTP_403_FORBIDDEN)
            storage.save()

            upload = PartialUpload(file_size=file_size, uploader=user)
            upload.save()

        return Response(
            status=status.HTTP_201_CREATED,
            headers={
                "Location": "/api/upload/flow/" + str(upload._id)
            }
        )


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
            file_path.touch(exist_ok=True)
            with partial_upload.file_path().open('ab') as partial_file:
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
            directory.files.add(file_record)
            new_path = Path(settings.COMPLETE_UPLOAD_PATH, str(file_record._id))
            partial_upload.file_path().rename(new_path)

            partial_upload.is_complete = True
            partial_upload.delete()

            return Response(
                status=status.HTTP_201_CREATED,
                headers={
                    "Location": "/api/file" + str(file_record._id)
                },
            )

from rest_framework import generics
class TestAPI(generics.CreateAPIView):
    