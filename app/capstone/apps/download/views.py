from django.shortcuts import render
from rest_framework.response import Response
from rest_framework import generics, status
from django.shortcuts import get_object_or_404
from django.conf import settings
from django.http import Http404
from .models import File
from .serializers import FileDownloadSerializer, FileSerializer
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.views import APIView
import sys, os
sys.path.append(os.path.dirname(os.path.abspath(os.path.dirname(__file__))))
from capstone.account.models import User
# Create your views here.

class FileListAPI(generics.ListAPIView):
    serializer_class = FileSerializer
    queryset = File.objects.all()

    def delete(self, request):
        for file in self.get_queryset():
            file.delete()
        return Response({"message" : "삭제 완료."}, status=status.HTTP_204_NO_CONTENT)


class FileDownloadAPI(generics.GenericAPIView):
    serializer_class = FileDownloadSerializer
    permission_classes = (IsAuthenticated, ) #추후에 권한 필요하도록 IsAuthenticated로 수정해야 함. 개발용 설정

    def post(self, request, file_id): # 테스트 하기 위한 모델 생성용
        print(request.data)
        serializer=self.get_serializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({"message" : "파일 정보 저장 완료."}, status=status.HTTP_200_OK)
        else:
            return Response({'error' : '입력 형식 확인바람.'}, status=status.HTTP_400_BAD_REQUEST)

    def get(self, request, file_id): #특정 사용자의 고유 ID와 함께 파일 이름 전달
        try:
            user=get_object_or_404(User, username=request.user.username) # 사용자 이름으로 받을까? 고유 ID로 받을까?
        except(Http404):
            return Response({"error": "사용자가 존재하지 않습니다."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            print(user)
            print(file_id)
            file=get_object_or_404(File, user=user, _id=file_id)
        except(Http404):
            return Response({"error" : "해당 파일 이름으로 저장된 파일이 존재하지 않습니다."},
                                 status=status.HTTP_404_NOT_FOUND)

        response=Response()
        response['Content-Dispostion'] = 'attachment; filename={0}'.format(file.file_name) # 웹 페이지에 보여질 파일 이름을 결정한다.
        response['X-Accel-Redirect'] = '/media/files/{0}/{1}'.format(request.user.username, file._id + os.path.splitext(file.file_name)[1]) # 서버에 저장되어 있는 파일 경로를 Nginx에게 알려준다.
                                                                                                # nginx 컨테이너 상에서 /media/files 폴더 아래에
                                                                                                # <사용자 ID>/<파일 이름> 의 경로에서 다운로드 받게 한다.
        print('/media/files/{0}/{1}'.format(request.user.username, file._id + os.path.splitext(file.file_name)[1]))
        return response

class GetFileIDAPI(APIView):
    def get(self, request, file_name):
        try:
            file=get_object_or_404(File, owner_name=request.user.username, file_name=file_name)
        except(Http404):
            return Response({'error' : '파일이 존재하지 않습니다.'}, status=status.HTTP_400_BAD_REQUEST)

        return Response({'id' : file._id}, status=status.HTTP_200_OK)

