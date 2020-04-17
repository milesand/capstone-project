from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils.translation import ugettext_lazy as _
# Create your models here.

# User model custom.
class User(AbstractUser):
    email = models.EmailField(_('이메일 주소'), unique=True)
    username = models.CharField(_('닉네임'), max_length=50, unique=True)
    is_mail_authenticated = models.BooleanField(default=False) # 메일 인증 수행 시 True로 변환됨. 기본값 False
    phone_num = models.CharField(_('전화 번호'), max_length=20)
    password = models.CharField(_('비밀번호'), max_length=15)
    password_val = models.CharField(_('비밀번호 확인'), max_length=15)