from rest_framework import generics, status
from rest_framework.response import Response
from .serializers import ThumbSerializer

from imagekit import ImageSpec
from imagekit.processors import ResizeToFill
# Create your views here.

#django-imagekit
class Thumbnail(ImageSpec):
    processors = [ResizeToFill(100, 100)]
    format = "JPEG"
    options = {'quality': 100}

import os
class ThumbnailAPI(generics.GenericAPIView):
    serializer_class = ThumbSerializer

    def post(self, request):
        serializer=self.serializer_class(data=request.data)

        print(os.getcwd() + '/' + request.data['path'])
        if serializer.is_valid():
            try:
                source_file=open(os.getcwd() + '/' + request.data['path'], 'rb')
            except:
                return Response({"message" : "파일이 존재하지 않습니다."}, status=status.HTTP_400_BAD_REQUEST)

            image_generator=Thumbnail(source=source_file)
            result=image_generator.generate()

            destURL=os.getcwd() + '/file/%s/testMail.jpg' % request.user
            file=open(destURL, 'wb')
            file.write(result.read())
            file.close()

            return Response({"url" : destURL}, status=status.HTTP_200_OK)
        else:
            return Response(status=status.HTTP_400_BAD_REQUEST)