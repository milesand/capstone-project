from rest_framework import serializers
from .models import User
from bson.objectid import ObjectId

from rest_framework_jwt.authentication import JSONWebTokenAuthentication
from rest_framework_jwt.serializers import RefreshJSONWebTokenSerializer, VerifyJSONWebTokenSerializer
from rest_framework_jwt.views import RefreshJSONWebToken, VerifyJSONWebToken

import os
BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from capstone.storage.serializers import UserStorageSerializer

#jwt 인증 관련 시리얼라이저 오버라이딩
RefreshJSONWebTokenSerializer._declared_fields.pop('token')
VerifyJSONWebTokenSerializer._declared_fields.pop('token')

class VerifyJSONWebTokenSerializerCookieBased(VerifyJSONWebTokenSerializer):
    def validate(self, data):
        data['token'] = JSONWebTokenAuthentication().get_jwt_value(self.context['request'])
        return super(VerifyJSONWebTokenSerializerCookieBased, self).validate(data)

class RefreshJSONWebTokenSerializerCookieBased(RefreshJSONWebTokenSerializer):
    def validate(self, data):
        data['token'] = JSONWebTokenAuthentication().get_jwt_value(self.context['request'])
        return super(RefreshJSONWebTokenSerializerCookieBased, self).validate(data)

VerifyJSONWebToken.serializer_class = RefreshJSONWebTokenSerializerCookieBased
RefreshJSONWebToken.serializer_class = RefreshJSONWebTokenSerializerCookieBased

# 회원가입
class UserAccountSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('username', 'nickname', 'password', 'email', 'phone_num', 'social_auth', 'is_mail_authenticated')

    def create(self, validated_data):
        phone = ""
        social = ""
        mail_auth = False

        # 전화번호 필드 입력되었을 경우 해당 번호로 수정
        if 'phone_num' in validated_data:
            phone = validated_data['phone_num']

        # 소셜 로그인일 경우 메일 인증 안받도록 수정
        if 'social_auth' in validated_data and validated_data['social_auth'] != '':
            social = validated_data['social_auth']
            mail_auth = True

        user = User.objects.create_user(
            # User.objects.create_user(username, email=None, password=None, **extra_fields) :
            # 새로운 사용자를 만들어서 저장한 뒤 만든 사용자(User object)를 리턴한다. 이 User 객체는
            # is_active 필드가 True로 설정되어 있다.
            # username : set
            # password : set
            # email : 자동으로 소문자로 변환됨.
            _id=ObjectId(),
            username=validated_data["username"],
            nickname=validated_data["nickname"],
            email=validated_data['email'],
            password=validated_data["password"],
            phone_num=phone,
            is_mail_authenticated=mail_auth,
            # password_val=make_password(validated_data["password_val"]), # 패스워드 확인 필드도 암호화시켜준다. 프론트엔드쪽에서 처리.
            social_auth=social,
        )
        # user.is_active=False
        user.save()
        return user

# 유저 정보 출력
class UserSerializer(serializers.ModelSerializer):
    invitationList=serializers.StringRelatedField(many=True, read_only=True)
    memberList=serializers.StringRelatedField(many=True, read_only=True)
    directory_info=UserStorageSerializer(read_only=True)
    class Meta:
        model = User
        fields = ('_id', 'username', 'nickname', 'password', 'phone_num', 'email', 'is_mail_authenticated', 'social_auth', 'invitationList', 'memberList', 'directory_info')

#소셜 로그인, 아이디 및 패스워드 제한 없음.
class SocialLoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField()

# 일반 로그인, 아이디 및 패스워드 15자 제한
class UserLoginSerializer(serializers.Serializer):
    username = serializers.CharField(max_length=15)
    password = serializers.CharField(max_length=15)

#ID/비밀번호 찾기
class FindIDPasswordSerializer(serializers.Serializer):
    IDorPassword=serializers.RegexField(regex=r"id|password")
    username=serializers.CharField(min_length=8, max_length=15, allow_blank=True)
    email=serializers.EmailField()

class SocialAccessTokenSerializer(serializers.Serializer):
    access_token=serializers.CharField(max_length=300)
    social_auth=serializers.RegexField(regex="google|facebook")

class TeamListSerializer(serializers.ModelSerializer):
    invitationList=serializers.StringRelatedField(many=True, read_only=True)

    class Meta:
        model=User
        fields=('_id', 'username', 'invitationList',)