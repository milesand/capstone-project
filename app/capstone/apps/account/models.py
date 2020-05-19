from django.db import models
from django.contrib.auth.models import AbstractUser

# Create your models here.

# User model custom.
class User(AbstractUser):
    _id=models.CharField(
        max_length=24,
        primary_key=True)

    nickname=models.CharField(max_length=15)

    email = models.EmailField(unique=True) #배포용

    #email = models.EmailField(_('이메일 주소')) #테스트용

    username = models.CharField(
        max_length=100,
        unique=True)

    is_mail_authenticated = models.BooleanField(
        default=False,
        blank=True) # 메일 인증 수행 시 True로 변환됨. 기본값 False

    phone_num = models.CharField(
        max_length=20,
        default="",
        blank=True) #선택사항

    password = models.CharField(
        max_length=100,
        blank=True)

    social_auth=models.CharField(
        max_length=20,
        default="None",
        blank=True)

    def __str__(self):
        return self.username
