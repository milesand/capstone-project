from .models import Team
from rest_framework import serializers
from django.db import models

class CreateTeamSerializer(serializers.ModelSerializer):
    class Meta:
        model=Team
        fields=('teamName', 'teamLeader')
        #fields = '__all__'

    def create(self, validated_data):
        team=Team.objects.create(
            teamName=validated_data['teamName'],
            teamLeader=validated_data['teamLeader']
        )

        return team

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
