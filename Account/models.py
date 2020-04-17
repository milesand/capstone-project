from django.db import models
from django.contrib.auth.models import PermissionsMixin, AbstractUser
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

'''class Profile(models.Model):
    user=models.OneToOneField(User, on_delete=models.CASCADE) # OneToOneField : 일대일 관계를 말한다. 개념적으로는 Unique=True를 적용한
                                                              # ForeignKey와 비슷하지만, 관계에서 "역참조" 측면에서는 단일 개체를 직접
                                                              # 리턴하는 점이 다르다. 즉, 참조 받는 쪽에서도 참조하는쪽을 참조할 수 있다.
    #user_pk=models.IntegerField(blank=True)
    nickname=models.CharField(max_length=200, blank=True)
    phone=models.CharField(max_length=200, blank=True)

@receiver(post_save, sender=User) # post_save : sender(User) 모델 인스턴스 생성에 맞춰 실행된다. 이를 통해 User 객체를 생성하면 Profile 객체도
                                  #             함께 생성된다.
def create_user_profile(sender, instance, created, **kwargs):
    if created:
        #Profile.objects.create(user=instance, user_pk=instance.id)
         Profile.objects.create(user=instance)

@receiver(post_save, sender=User)
def save_user_profile(sender, instance, **kwargs):
    instance.profile.save()'''
