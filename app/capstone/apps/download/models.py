import sys, os
BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from django.conf import settings
from django.db import models
from djongo import models as mongo_models
from django.db.models.signals import post_save
from django.dispatch import receiver
from capstone.account.models import User

# Create your models here.
class File(models.Model):
    _id = models.CharField(
        max_length=200,
        primary_key=True)

    user=models.ForeignKey(
        to=settings.AUTH_USER_MODEL,
        db_index=False,
        unique=False,
        on_delete=models.CASCADE,
        related_name='file_a') # File 모델을 특정 사용자와 many-to-one 관계로 연결

    owner_name=models.CharField(
        max_length=15,
        default='')

    file_name=models.CharField(max_length=200)
    file_path=models.CharField(max_length=200)

from rest_framework.response import Response
from rest_framework import status
@receiver(post_save, sender=File)
def link_file_to_user(sender, instance, created, **kwargs):
    if created:
        try:
            user=User.objects.get(username=instance.owner_name)
        except:
            return Response({'error' : '유저 없음.'}, status=status.HTTP_404_NOT_FOUND)
        instance.user=user
        instance.save()

