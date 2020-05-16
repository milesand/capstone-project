from django.db import models
from django.conf import settings
from djongo import models as mongo_models

# Create your models here.

class Team(models.Model):
    _id=mongo_models.ObjectIdField(primary_key=True)
    teamName=models.CharField(max_length=20) #팀명 20자 이내
    
    teamLeader=models.ForeignKey(
        settings.AUTH_USER_MODEL,
        to_field='username',
        related_name= 'leader',
        on_delete=models.CASCADE,
        unique=False) #팀장 외래키로 저장, 닉네임으로 표시됨.

    invitationList=mongo_models.ArrayReferenceField(
        to=settings.AUTH_USER_MODEL,
        related_name='invitationList',
        on_delete=models.CASCADE,
        blank=True)

    memberList=mongo_models.ArrayReferenceField(
        to=settings.AUTH_USER_MODEL,
        related_name='memberList',
        on_delete=models.CASCADE,
        blank=True)

    shareFolders=mongo_models.ArrayReferenceField(
        to='storage.Directory',
        on_delete=models.CASCADE,
        blank=True)

    def __str__(self):
        return str(self._id)