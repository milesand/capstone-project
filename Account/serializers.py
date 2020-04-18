from rest_framework import serializers
from django.contrib.auth import authenticate
from django.contrib.auth.hashers import make_password
from .models import User

#회원가입
class UserAccountSerializer(serializers.ModelSerializer):
    class Meta:
        model=User
        fields=('id', 'username', 'password', 'password_val', 'email', 'phone_num') #사용자 닉네임, 비밀번호, 비밀번호 확인, 이메일, 전화번호
        #extra_kwargs={"password" : {'write_only' : True}}

    def create(self, validated_data):
        user=User.objects.create_user( #User.objects.create_user(username, email=None, password=None, **extra_fields) :
                                       # 새로운 사용자를 만들어서 저장한 뒤 만든 사용자(User object)를 리턴한다. 이 User 객체는
                                       # is_active 필드가 True로 설정되어 있다.
                                       # username : set
                                       # password : set
                                       # email : 자동으로 소문자로 변환됨.
            username=validated_data["username"],
            email=validated_data['email'],
            password=validated_data["password"],
            password_val=make_password(validated_data["password_val"]), # 패스워드 확인 필드도 암호화시켜준다.
            phone_num=validated_data["phone_num"],
        )
        #user.is_active=False
        user.save()
        return user


#접속 유지중인지 확인
class UserSerializer(serializers.ModelSerializer):
    class Meta:
        #model = CustomUser
        model=User
        fields=('id', 'username', 'password', 'password_val', 'phone_num', 'email', 'is_mail_authenticated')

#로그인
class UserLoginSerializer(serializers.Serializer):
    username=serializers.CharField()
    password=serializers.CharField()

    def validate(self, data):
        user=authenticate(**data)
        if user and user.is_active:
            if user.is_mail_authenticated:
                return user
            else:
                raise serializers.ValidationError("메일 인증이 필요합니다. 가입 시 입력한 이메일을 통해 인증 절차를 진행해주세요.") # 메일인증 미수행
        raise serializers.ValidationError("아이디나 비밀번호가 일치하지 않습니다.")
