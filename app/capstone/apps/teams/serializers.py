from .models import Team
from rest_framework import serializers
from bson.objectid import ObjectId
from django.db import models
from rest_meets_djongo.serializers import DjongoModelSerializer
class CreateTeamSerializer(DjongoModelSerializer):
    class Meta:
        model=Team
        fields=('teamName', 'teamLeader')
        #fields = '__all__'

    def create(self, validated_data):
        team=Team.objects.create(
            _id=ObjectId(),
            teamName=validated_data['teamName'],
            teamLeader=validated_data['teamLeader']
        )

        return team

class TeamSerializer(DjongoModelSerializer):
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
    folderID=serializers.CharField(max_length=24)
    def validate(self, data):
        if ObjectId.is_valid(data['folderID']):
           return data
        else:
            raise serializers.ValidationError("ObjectID 값이 유효하지 않습니다.")
