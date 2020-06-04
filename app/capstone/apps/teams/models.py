import uuid

from django.db import models
from django.conf import settings


# Create your models here.

class Team(models.Model):
    _id = models.UUIDField(primary_key=True, default=uuid.uuid4)

    team_name = models.CharField(max_length=20)  # 팀명 20자 이내

    team_leader = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        to_field='username',
        related_name='leader',
        on_delete=models.CASCADE,
        unique=False)  # 팀장 외래키로 저장, 닉네임으로 표시됨.

    team_leader_nickname = models.CharField(max_length=15)
    invitation_list = models.ManyToManyField(
        to=settings.AUTH_USER_MODEL,
        related_name='invitationList',
        blank=True)

    member_list = models.ManyToManyField(
        to=settings.AUTH_USER_MODEL,
        related_name='teamList',
        blank=True)

    share_folders = models.ManyToManyField(
        to='storage.Directory',
        blank=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=['teamLeader', 'teamName'],
                name="unique_teamname_per_teamLeader",
            ),
        ]

    def __str__(self):
        return str(self._id)