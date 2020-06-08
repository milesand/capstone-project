from django.contrib.auth import get_user_model
from .models import Team
from rest_framework import serializers
import os
os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from capstone.account.serializers import UserIDNickSerializer
from capstone.storage.serializers import DirectorySerializer
class CreateTeamSerializer(serializers.ModelSerializer):
    class Meta:
        model=Team
        fields=('team_name', 'team_leader')
        #fields = '__all__'

    def create(self, validated_data):
        team=Team.objects.create(
            team_name=validated_data['team_name'],
            team_leader=validated_data['team_leader'],
            team_leader_nickname=validated_data['team_leader'].nickname,
        )
        team.save()
        return team

class TeamSerializer(serializers.ModelSerializer):
    member_list=UserIDNickSerializer(many=True)
    share_folders=DirectorySerializer(many=True, read_only=True)
    class Meta:
        model=Team
        fields = '__all__'

class ChangeTeamNameSerializer(serializers.ModelSerializer):
    class Meta:
        model=Team
        fields=('team_name', )

class InvitationSerializer(serializers.Serializer):
    username=serializers.CharField(max_length=100)

class UserSearchSerializer(serializers.Serializer):
    username=serializers.CharField()

class UserSearchResultSerializer(serializers.ModelSerializer):
    class Meta:
        model=get_user_model()
        fields=('pk', 'username', 'nickname', 'email')