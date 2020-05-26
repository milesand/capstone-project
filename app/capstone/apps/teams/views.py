from django.shortcuts import render
from .models import Team
from .serializers import CreateTeamSerializer, TeamSerializer, ChangeTeamNameSerializer, InvitationSerializer, SharingFolderSerializer
from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.http import Http404
# Create your views here.
import sys, os
sys.path.append(os.path.dirname(os.path.abspath(os.path.dirname(__file__))))
from capstone.account.models import User
from capstone.storage.models import Directory

import json
from rest_framework.test import APIRequestFactory
class CreateTeamAPI(generics.ListCreateAPIView):
    permission_classes = (IsAuthenticated, )

    def post(self, request): #팀 생성
        serializer_class=self.get_serializer_class()
        request.POST._mutable=True

        try:
            leader=get_object_or_404(User, username=request.data['teamLeader'])
            print('leader : ', leader)
        except(Http404):
            return Response(status=status.HTTP_404_NOT_FOUND)

        request.data['teamLeader']=leader
        print("cr : ", request)
        serializer=serializer_class(data=request.data)
        print("serializer : ", serializer)
        if serializer.is_valid():
            print('here.')
            serializer.save()
            return Response({'message' : '팀 생성 완료'}, status=status.HTTP_200_OK)
        else:
            return Response({'error' : '입력 형식을 확인해주세요.'}, status=status.HTTP_400_BAD_REQUEST)

    def get_serializer_class(self):
        if self.request.method=='GET':
            return TeamSerializer
        return CreateTeamSerializer

    def get_queryset(self):
        return Team.objects.filter(teamLeader=self.request.user)

class TeamAPI(generics.GenericAPIView):
    serializer_class = TeamSerializer
    permission_classes = (IsAuthenticated, )

    def get(self, request, teamID):
        try:
            team=get_object_or_404(Team, pk=teamID)
        except(Http404):
            return Response({'error' : '해당하는 팀이 존재하지 않습니다.'}, status=status.HTTP_404_NOT_FOUND)

        return Response(self.serializer_class(team).data, status=status.HTTP_200_OK)

    def delete(self, request, teamID):
        try:
            team=get_object_or_404(Team, _id=teamID)
        except(Http404):
            return Response({'error' : '해당하는 팀이 존재하지 않습니다.'}, status=status.HTTP_404_NOT_FOUND)

        team.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

    def put(self, request, teamID): #팀명 수정
        self.serializer_class=ChangeTeamNameSerializer
        serializer=self.serializer_class(data=request.data)
        if serializer.is_valid():
            team=Team.objects.get(_id=teamID)
            team.teamName=request.data['teamName']
            team.save()
            return Response({'message : 팀 이름 변경 완료'}, status=status.HTTP_200_OK)
        else:
            return Response({'error': '입력 형식을 확인해주세요.'}, status=status.HTTP_400_BAD_REQUEST)


class InvitationAPI(generics.GenericAPIView): # 새로운 유저를 팀으로 초대한다.
    serializer_class = InvitationSerializer
    permission_classes = (IsAuthenticated, )
    def put(self, request, teamID):
        #request.user는 로그인 헀을 때 해당 사용자를 리턴한다.
        serializer=self.serializer_class(data=request.data)
        if serializer.is_valid():
            try:
                team=get_object_or_404(Team, _id=teamID)
            except(Http404):
                return Response({'error' : '해당하는 팀이 존재하지 않습니다.'}, status=status.HTTP_404_NOT_FOUND)

            if request.user!=team.teamLeader: #초대 요청한 사람이 팀장이 아닌 경우
                return Response({'error' : '초대 권한이 없습니다.'}, status=status.HTTP_401_UNAUTHORIZED)

            #초대 요청한 사람이 팀장
            invitedUser=User.objects.get(username=request.data['username'])
            if invitedUser in team.invitationList.all():
                return Response({'error' : '해당 사용자에게 이미 초대를 보냈습니다.'}, status=status.HTTP_400_BAD_REQUEST)

            team.invitationList.add(invitedUser)
            return Response({'message' : '성공!'}, status=status.HTTP_200_OK)
        else:
            return Response({'error': '입력 형식을 확인해주세요.'}, status=status.HTTP_400_BAD_REQUEST)

class AcceptInvitationAPI(APIView):
    permission_classes = (IsAuthenticated, )
    def put(self, request, teamID):
        team=Team.objects.get(pk=teamID)
        user=request.user
        if user in team.invitationList.all(): # 해당 사용자가 초대 목록에 존재할 경우
            team.invitationList.remove(user)
            team.memberList.add(user)
            team.save()
            return Response({'message' : '팀원 추가 완료.'}, status=status.HTTP_200_OK)
        else:
            return Response({'error' : '초대 목록에 사용자가 존재하지 않습니다.'}, status=status.HTTP_404_NOT_FOUND)

    def delete(self, request, teamID):
        team = Team.objects.get(pk=teamID)
        user = request.user
        if user in team.invitationList.all():  # 해당 사용자가 초대 목록에 존재할 경우
            team.invitationList.remove(user)
            team.save()
            return Response({'message': '초대를 거부했습니다.'}, status=status.HTTP_200_OK)
        else:
            return Response({'error': '초대 목록에 사용자가 존재하지 않습니다.'}, status=status.HTTP_404_NOT_FOUND)

class SecessionAPI(APIView):
    permission_classes = (IsAuthenticated, )
    def put(self, request, teamID):
        team=Team.objects.get(pk=teamID)
        user=request.user
        if user in team.memberList.all(): #요청한 사용자가 해당 팀에 속해있을 경우
            team.memberList.remove(user)
            team.save()
            return Response({'message' : '팀에서 탈퇴했습니다.'}, status=status.HTTP_200_OK)
        else:
            return Response({'error' : '잘못된 접근입니다.'}, status=status.HTTP_400_BAD_REQUEST)

class SharingFolderAPI(generics.GenericAPIView):
    serializer_class = SharingFolderSerializer
    permission_classes = (IsAuthenticated, )

    def errorCheck(self, request):
        user=request.user
        try:
            directory = get_object_or_404(Directory, pk=request.data['folderID'])
        except(Http404):
            return Response({'error': '요청한 폴더가 존재하지 않습니다.'}, status=status.HTTP_400_BAD_REQUEST)

        if user != directory.owner:  # 요청자가 해당 폴더의 소유자가 아닐 경우
            return Response({'error': '해당 폴더에 대한 권한이 없습니다.'}, status=status.HTTP_401_UNAUTHORIZED)

        if directory in Team.shareFolders.all():  # 이미 공유 설정이 되어있는 폴더일 경우
            return Response({'error': '이미 공유 설정 되어있는 폴더입니다.'}, status=status.HTTP_400_BAD_REQUEST)
        return directory

    def post(self, request, teamID):
        serializer=self.serializer_class(data=request.data)
        if serializer.is_valid():

            team=Team.objects.get(pk=teamID)
            user=request.user
            directory=self.errorCheck(request)
            if directory is Response:
                return directory

            team.shareFolders.add(directory)
            return Response({'message' : '공유폴더 설정 완료.'}, status=status.HTTP_200_OK)

        else:
            return Response({'message' : '입력 형식을 확인해주세요.'}, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, teamID): #공유설정 해제
        serializer=self.serializer_class(data=request.data)
        if serializer.is_valid():
            team = Team.objects.get(pk=teamID)
            user = request.user
            directory = self.errorCheck(request)
            if directory is Response:
                return directory

            team.shareFolders.remove(directory)
            return Response({'message' : '공유 설정이 해제되었습니다.'}, status=status.HTTP_200_OK)
        else:
            return Response({'message': '입력 형식을 확인해주세요.'}, status=status.HTTP_400_BAD_REQUEST)






