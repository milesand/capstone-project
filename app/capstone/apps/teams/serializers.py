from .models import Team
from rest_framework import serializers
from bson.objectid import ObjectId
from django.db import models
from rest_meets_djongo.serializers import DjongoModelSerializer
class TeamSerializer(DjongoModelSerializer):
    class Meta:
        model=Team
        #fields=('teamName', 'teamLeader', 'memberList')
        fields = '__all__'

    def create(self, validated_data):
        team=Team.objects.create(
            _id=ObjectId(),
            teamName=validated_data['teamName'],
            teamLeader=validated_data['teamLeader']
        )

        return team

class ChangeTeamNameSerializer(serializers.ModelSerializer):
    class Meta:
        model=Team
        fields=('teamName', )

class InvitationSerializer(serializers.Serializer):
    username=serializers.CharField(max_length=15)