import os
BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from capstone.account.models import User
from .models import Team

from django.shortcuts import Http404, get_object_or_404
from rest_framework import serializers
from django.db import models


class CreateTeamSerializer(serializers.ModelSerializer):
    class Meta:
        model=Team
        fields=('teamName', 'teamLeader')
        #fields = '__all__'

class TeamSerializer(serializers.ModelSerializer):
    class Meta:
        model=Team
        fields = '__all__'

class ChangeTeamNameSerializer(serializers.ModelSerializer):
    class Meta:
        model=Team
        fields=('teamName', )

class InvitationSerializer(serializers.Serializer):
    username=serializers.CharField(max_length=15)

class SharingFolderSerializer(serializers.Serializer): #공유폴더 설정
    folderID=serializers.UUIDField()
