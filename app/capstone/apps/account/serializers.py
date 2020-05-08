from rest_framework import serializers
from django.contrib.auth import authenticate
from .models import User, File
from bson.objectid import ObjectId

from rest_framework_jwt.authentication import JSONWebTokenAuthentication
from rest_framework_jwt.serializers import RefreshJSONWebTokenSerializer, VerifyJSONWebTokenSerializer
from rest_framework_jwt.views import RefreshJSONWebToken, VerifyJSONWebToken

from django.core.validators import RegexValidator
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
        fields = ('username', 'password', 'email', 'phone_num', 'social_auth', 'is_mail_authenticated')

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


# 접속 유지중인지 확인
class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('_id', 'username', 'password', 'phone_num', 'email', 'is_mail_authenticated', 'social_auth')

# 로그인
class UserLoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField()

    def validate(self, data):
        user = authenticate(**data)
        if user and user.is_active:
            if user.is_mail_authenticated:
                return user
            else:
                raise serializers.ValidationError("메일 인증이 필요합니다. 가입 시 입력한 이메일을 통해 인증 절차를 진행해주세요.")  # 메일인증 미수행
        raise serializers.ValidationError("아이디나 비밀번호가 일치하지 않습니다.")

#ID/비밀번호 찾기
class FindIDPasswordSerializer(serializers.Serializer):
    IDorPassword=serializers.RegexField(regex=r"id|password")
    username=serializers.CharField(min_length=8, max_length=15, allow_blank=True)
    email=serializers.EmailField()

#파일 업로드용
class FileSerializer(serializers.ModelSerializer):
    class Meta:
        model = File
        fields=("file",)
