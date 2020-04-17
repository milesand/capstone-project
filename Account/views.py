from django.shortcuts import render
from rest_framework import viewsets, permissions, generics, status
from rest_framework.response import Response
from rest_framework.views import APIView
from knox.models import AuthToken # 토큰 기반의 django rest 인증 모듈
#from .serializers import UserAccountSerializer, UserSerializer, UserLoginSerializer, ProfileSerializer
from .serializers import UserAccountSerializer, UserSerializer, UserLoginSerializer
from .models import User

#소셜 로그인에 사용하는 모듈
from allauth.socialaccount.providers.facebook.views import FacebookOAuth2Adapter
from allauth.socialaccount.providers.github.views import GitHubOAuth2Adapter
from allauth.socialaccount.providers.oauth2.client import OAuth2Client
from rest_auth.registration.views import SocialLoginView
# Create your views here.

#소셜 로그인
#페이스북
class FacebookLogin(SocialLoginView):
    adapter_class = FacebookOAuth2Adapter

#Github
'''class GithubLogin(SocialLoginView):
    adapter_class = GitHubOAuth2Adapter'''

class RegistrationAPI(generics.GenericAPIView):
    serializer_class = UserAccountSerializer

    def post(self, request, *args, **kwargs):
        if request.data['password']!=request.data['password_val']:
            body={"message" : '비밀번호가 일치하지 않습니다.'}
            return Response(body, status=status.HTTP_400_BAD_REQUEST)

        if len(request.data['password'])<7 or len(request.data['password'])>=15:
            body={"message" : 'too short or too long field'}
            return Response(body, status=status.HTTP_400_BAD_REQUEST)
        serializer=self.get_serializer(data=request.data) # get_serializer(self, instance=None, data=None, many=False, partial=False)
                                                          # serializer 인스턴스를 반환한다. 여기서는 요청으로 들어온 serializer를 구하기 위해 사용
        if serializer.is_valid():
            user=serializer.save()
            return Response( #Response(data, status=None, template_name=None, headers=None, content_type=None)
                             # data : response를 위한 직렬화된 데이터(만들어놓은 Serailizer 클래스 사용)
                             # status : 응답으로 보내는 상태 코드
                             # template_name : HTMLRenderer가 선택되어 있을 경우 사용하는 template 이름
                             # headers : 응답에 넣을 HTTP 헤더, dictionary 형태
                             # content_type : 응답의 content type. 보통 자동적으로 정해진다.
                {
                    "user" : UserSerializer(
                        user, context=self.get_serializer_context()
                    ).data,
                    "token" : AuthToken.objects.create(user)[1],
                }
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

'''class RegistrationAPI(generics.GenericAPIView):
    serializer_class = UserAccountSerializer

    def post(self, request, *args, **kwargs):
        if len(request.data['password'])<7 or len(request.data['password'])>=15:
            body={"message" : 'too short or too long field'}
            return Response(body, status=status.HTTP_400_BAD_REQUEST)
        serializer=self.get_serializer(data=request.data) # get_serializer(self, instance=None, data=None, many=False, partial=False)
                                                          # serializer 인스턴스를 반환한다. 여기서는 요청으로 들어온 serializer를 구하기 위해 사용
        if serializer.is_valid():
            user=serializer.save()
            return Response( #Response(data, status=None, template_name=None, headers=None, content_type=None)
                             # data : response를 위한 직렬화된 데이터(만들어놓은 Serailizer 클래스 사용)
                             # status : 응답으로 보내는 상태 코드
                             # template_name : HTMLRenderer가 선택되어 있을 경우 사용하는 template 이름
                             # headers : 응답에 넣을 HTTP 헤더, dictionary 형태
                             # content_type : 응답의 content type. 보통 자동적으로 정해진다.
                {
                    "user" : UserSerializer(
                        user, context=self.get_serializer_context()
                    ).data,
                    "token" : AuthToken.objects.create(user)[1],
                }
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)'''


class LoginAPI(generics.GenericAPIView):
    serializer_class = UserLoginSerializer

    def post(self, request, *args, **kwargs):
        serializer=self.get_serializer(data=request.data)
        if serializer.is_valid():
            user=serializer.validated_data
            return Response(
                {
                    "user" : UserSerializer(
                        user, context=self.get_serializer_context() # get_serializer_context() : GenericAPIView의 함수이며,
                                                                    # serilizer에 추가되어야 하는 추가 정보들을 dictionary 형태로 반환한다.
                    ).data,
                    "token" : AuthToken.objects.create(user)[1],
                }
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class UserAPI(generics.ListAPIView):
    #permission_classes = [permissions.IsAuthenticated]
    serializer_class = UserSerializer
    queryset = User.objects.all()


'''class ProfileUpdateAPI(generics.UpdateAPIView):
    lookup_field = "user_pk"
    queryset = Profile.objects.all()
    serializer_class = ProfileSerializer'''
