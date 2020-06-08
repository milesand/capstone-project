from django.shortcuts import render
from .models import Team
from .serializers import CreateTeamSerializer, TeamSerializer, ChangeTeamNameSerializer,\
                         InvitationSerializer, UserSearchResultSerializer
from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.contrib.auth import get_user_model
from django.shortcuts import get_object_or_404
from django.http import Http404
from django.db import IntegrityError
from django.db.models import Q
from django.db import transaction
# Create your views here.
import sys, os
sys.path.append(os.path.dirname(os.path.abspath(os.path.dirname(__file__))))
from capstone.storage.models import Directory

class CreateTeamAPI(generics.ListCreateAPIView):
    permission_classes = (IsAuthenticated, )

    def post(self, request): #팀 생성
        print("create team, req data : ", request.data)
        serializer_class=self.get_serializer_class()
        request.POST._mutable=True
        User=get_user_model()
        print('request data : ', request.data)
        try:
            leader=get_object_or_404(User, username=request.data['team_leader'])
            print('leader : ', leader)
        except(Http404):
            return Response(status=status.HTTP_404_NOT_FOUND)

        request.data['team_leader']=leader
        print("cr : ", request)
        serializer=serializer_class(data=request.data)
        print("serializer : ", serializer)
        if serializer.is_valid():
            print('here.')
            try:
                serializer.save()
                return Response({'message' : '팀 생성 완료'}, status=status.HTTP_200_OK)
            except IntegrityError:
                print("here1")
                return Response({'error' : '중복된 팀이름입니다.'}, status=status.HTTP_400_BAD_REQUEST)
        else:
            print("here2")
            return Response({'error' : '입력 형식을 확인해주세요.'}, status=status.HTTP_400_BAD_REQUEST)

    def get_serializer_class(self):
        if self.request.method=='GET':
            return TeamSerializer
        return CreateTeamSerializer

    def get_queryset(self):
        return Team.objects.filter(team_leader=self.request.user)

class TeamAPI(generics.GenericAPIView):
    serializer_class = TeamSerializer
    permission_classes = (IsAuthenticated, )

    def get(self, request, teamID):
        try:
            team=get_object_or_404(Team, pk=teamID)
        except(Http404):
            return Response({'error' : '해당하는 팀이 존재하지 않습니다.'}, status=status.HTTP_404_NOT_FOUND)

        data=self.serializer_class(team).data

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
            team.team_name=request.data['team_name']
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
        User=get_user_model()
        print("request data : ", request.data)
        if serializer.is_valid():
            try:
                team=get_object_or_404(Team, _id=teamID)
            except(Http404):
                return Response({'error' : '해당하는 팀이 존재하지 않습니다.'}, status=status.HTTP_404_NOT_FOUND)

            if request.user!=team.team_leader: #초대 요청한 사람이 팀장이 아닌 경우
                return Response({'error' : '초대 권한이 없습니다.'}, status=status.HTTP_401_UNAUTHORIZED)

            invitedUser=get_object_or_404(User, username=request.data['username'])
            if invitedUser in team.invitation_list.all():
                return Response({'error' : '해당 사용자에게 이미 초대를 보냈습니다.'}, status=status.HTTP_400_BAD_REQUEST)

            elif invitedUser in team.member_list.all():
                return Response({'error' : '이미 팀에 가입중인 사용자입니다.'}, status=status.HTTP_400_BAD_REQUEST)

            team.invitation_list.add(invitedUser)
            return Response({'message' : '성공!'}, status=status.HTTP_200_OK)
        else:
            return Response({'error': '입력 형식을 확인해주세요.'}, status=status.HTTP_400_BAD_REQUEST)


class AcceptInvitationAPI(APIView):
    permission_classes = (IsAuthenticated, )
    def put(self, request, teamID):
        team=Team.objects.get(pk=teamID)
        user=request.user
        if user in team.invitation_list.all(): # 해당 사용자가 초대 목록에 존재할 경우
            team.invitation_list.remove(user)
            team.member_list.add(user)
            team.save()
            return Response({'message' : '팀원 추가 완료.'}, status=status.HTTP_200_OK)
        else:
            return Response({'error' : '초대 목록에 사용자가 존재하지 않습니다.'}, status=status.HTTP_404_NOT_FOUND)

    def delete(self, request, teamID):
        team = Team.objects.get(pk=teamID)
        user = request.user
        if user in team.invitation_list.all():  # 해당 사용자가 초대 목록에 존재할 경우
            team.invitation_list.remove(user)
            team.save()
            return Response({'message': '초대를 거부했습니다.'}, status=status.HTTP_200_OK)
        else:
            return Response({'error': '초대 목록에 사용자가 존재하지 않습니다.'}, status=status.HTTP_404_NOT_FOUND)


class SecessionAPI(APIView):
    permission_classes = (IsAuthenticated, )
    def put(self, request, teamID):
        team=Team.objects.get(pk=teamID)
        user=request.user
        if user in team.member_list.all(): #요청한 사용자가 해당 팀에 속해있을 경우
            team.member_list.remove(user)
            team.save()
            return Response({'message' : '팀에서 탈퇴했습니다.'}, status=status.HTTP_200_OK)
        else:
            return Response({'error' : '잘못된 접근입니다.'}, status=status.HTTP_400_BAD_REQUEST)

class JoinTeamAPI(generics.ListAPIView):
    serializer_class = TeamSerializer
    permission_classes = (IsAuthenticated, )

    def get_queryset(self):
        return Team.objects.filter(member_list__pk=self.request.user.pk)


# 공유폴더를 설정하거나 해제한다.
# request 형태는 {team1 : 팀 ID, team 2 : 팀 ID, team3 : 팀 ID ...} 형태
class SharingFolderAPI(APIView):
    permission_classes = (IsAuthenticated, )

    def errorCheck(self, user, pk, team):
        directory = get_object_or_404(Directory, pk=pk)
        if user != directory.owner:  # 요청자가 해당 폴더의 소유자가 아닐 경우
            return False

        if directory in team.share_folders.all():  # 이미 공유 설정이 되어있는 폴더일 경우
            return False
        return True

    def put(self, request, pk):
        try:
            dir=Directory.objects.get(owner=request.user, pk=pk)
        except:
            return Response({'error' : '권한이 없습니다.'}, status=status.HTTP_400_BAD_REQUEST)

        for teamID in request.data.values():
            try:
                team=get_object_or_404(Team, pk=teamID)
                team.share_folders.add(dir)
                team.save()
            except:
                return Response({'error': '공유 폴더 설정에 오류가 발생했습니다.'}, status=status.HTTP_400_BAD_REQUEST)

        return Response({'message' : '공유폴더 설정 완료.'}, status=status.HTTP_200_OK)

    def delete(self, request, pk): #공유설정 해제
        try:
            dir = Directory.objects.get(owner=request.user, pk=pk)
        except:
            return Response({'error' : '권한이 없습니다.'}, status=status.HTTP_400_BAD_REQUEST)

        for teamID in request.data.values():
            try:
                team = get_object_or_404(Team, pk=teamID)
                team.share_folders.remove(dir)
                team.save()
            except:
                return Response({'error': '공유 폴더 해제에 오류가 발생했습니다.'}, status=status.HTTP_400_BAD_REQUEST)

        return Response({'message': '공유폴더 해제 완료.'}, status=status.HTTP_200_OK)


class UserSearchAPI(APIView):
    serializer_class = UserSearchResultSerializer
    permission_classes = (IsAuthenticated, )

    def get(self, request, team_pk, name):
        print("here, pk : ", team_pk, "name : ", name, get_user_model())
        queryset=get_user_model().objects.filter(nickname__contains=name, is_mail_authenticated=True).filter(~Q(pk=request.user.pk)).filter(~Q(teamList=team_pk))

        print("queryset : ", queryset)
        return Response(self.serializer_class(queryset, many=True).data, status=status.HTTP_200_OK)





