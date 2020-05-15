from django.shortcuts import render
from .models import Team
from .serializers import TeamSerializer, ChangeTeamNameSerializer, InvitationSerializer
from rest_framework import generics, status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.http import Http404
# Create your views here.
import sys, os
sys.path.append(os.path.dirname(os.path.abspath(os.path.dirname(__file__))))
from capstone.account.models import User
class CreateTeamAPI(generics.ListCreateAPIView):
    serializer_class = TeamSerializer
    permission_classes = (AllowAny, ) #추후에 IsAuthenticated로 변경
    queryset = Team.objects.all()

    def post(self, request): #팀 생성
        team=self.serializer_class(data=request.data)
        if team.is_valid():
            print('here.')
            team.save()
            return Response({'message' : '팀 생성 완료'}, status=status.HTTP_200_OK)
        else:
            return Response({'error' : '입력 형식을 확인해주세요.'}, status=status.HTTP_400_BAD_REQUEST)


class TeamAPI(generics.GenericAPIView):
    serializer_class = TeamSerializer
    permission_classes = (AllowAny, )

    def get(self, request, teamID):
        try:
            team=get_object_or_404(Team, _id=teamID)
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

    def put(self, request, teamID):
        self.serializer_class=ChangeTeamNameSerializer
        serializer=self.serializer_class(data=request.data)
        if serializer.is_valid():
            team=Team.objects.get(_id=teamID)
            team.teamName=request.data['teamName']
            team.save()
            return Response({'message : 팀 이름 변경 완료'}, status=status.HTTP_200_OK)
        else:
            return Response({'error': '입력 형식을 확인해주세요.'}, status=status.HTTP_400_BAD_REQUEST)


class InvitationAPI(generics.GenericAPIView): # 새로운 유저를 팀으로 초한다.
    serializer_class = InvitationSerializer
    permission_classes = (AllowAny, )
    def post(self, request, teamID):
        #request.user는 로그인 헀을 때 해당 사용자를 리턴한다.
        serializer=self.serializer_class(data=request.data)
        if serializer.is_valid():
            try:
                team=get_object_or_404(Team, _id=teamID)
            except(Http404):
                return Response({'error' : '해당하는 팀이 존재하지 않습니다.'}, status=status.HTTP_404_NOT_FOUND)

            if request.user!=team.teamLeader: #초대 요청한 사람이 팀장이 아닌 경우
                return Response({'error' : '초대 권한이 없습니다.'}, status=status.HTTP_401_UNAUTHORIZED)

            print('here.')
            #초대 요청한 사람이 팀장
            invitedUser=User.objects.get(username=request.data['username'])
            print(invitedUser)
            team.invitationList.add(invitedUser)
            print(invitedUser.invitationList.all())
            print(team.invitationList.all())
            return Response({'message' : '성공!'}, status=status.HTTP_200_OK)
        else:
            return Response({'error': '입력 형식을 확인해주세요.'}, status=status.HTTP_400_BAD_REQUEST)









