from django.shortcuts import render
from rest_framework import generics, status, permissions
from rest_framework.response import Response
from knox.models import AuthToken # 토큰 기반의 django rest 인증 모듈
from django.contrib.auth import logout
from .serializers import UserAccountSerializer, UserSerializer, UserLoginSerializer
from .models import User
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny

#이메일 인증에 사용하는 모듈
from django.core.mail import EmailMessage
from django.contrib.sites.shortcuts import get_current_site
from django.template.loader import render_to_string
from django.utils.http import urlsafe_base64_decode, urlsafe_base64_encode
from django.utils.encoding import force_bytes
from django.core.mail import EmailMessage
from django.utils.encoding import force_bytes, force_text
from .tokens import account_activation_token

#소셜 로그인에 사용하는 모듈
'''from allauth.socialaccount.providers.facebook.views import FacebookOAuth2Adapter
from allauth.socialaccount.providers.github.views import GitHubOAuth2Adapter
from allauth.socialaccount.providers.oauth2.client import OAuth2Client
from rest_auth.registration.views import SocialLoginView'''
# Create your views here.

hostIP='localhost:8000' # 호스트 IP, 추후에 수정
'''#소셜 로그인
#페이스북
class FacebookLogin(SocialLoginView):
    adapter_class = FacebookOAuth2Adapter

#Github
class GithubLogin(SocialLoginView):
    adapter_class = GitHubOAuth2Adapter'''

class RegistrationAPI(generics.GenericAPIView):
    serializer_class = UserAccountSerializer

    def post(self, request, *args, **kwargs):
        if request.data['password']!=request.data['password_val']:
            body={"message" : '비밀번호가 일치하지 않습니다.'}
            return Response(body, status=status.HTTP_400_BAD_REQUEST)

        if len(request.data['password'])<7 or len(request.data['password'])>=15:
            body={"message" : '비밀번호가 너무 짧거나 너무 깁니다. 8자 이상 15자 이하로 설정해주세요.'}
            return Response(body, status=status.HTTP_400_BAD_REQUEST)

        serializer=UserAccountSerializer(data=request.data) # get_serializer(self, instance=None, data=None, many=False, partial=False)
                                                          # serializer 인스턴스를 반환한다. 여기서는 요청으로 들어온 serializer를 구하기 위해 사용
        if serializer.is_valid():
            user=serializer.save()

            message=render_to_string('account/user_active_email.html', {
                'user' : user,
                'domain' : hostIP,
                'uid' : urlsafe_base64_encode(force_bytes(user.pk)).encode().decode(),
                'token' : account_activation_token.make_token(user)
            })

            mail_title='사이트 회원가입 인증 메일입니다.' #인증 메일 제목, 추후에 수정
            to_email=request.data['email'] # 인증 메일을 받는 주소
            email=EmailMessage(mail_title, message, to=[to_email])
            email.send()
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
                } # 가입을 수행한 뒤 확인을 위해 유저 정보 및 토큰 정보 출력
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

#이메일 인증 API
class ActivateUserAPI(APIView):
    permission_classes = (AllowAny, )

    def get(self, request, uidb64, token):
        try:
            uid = force_text(urlsafe_base64_decode(uidb64))
            user = User.objects.get(pk=uid)
        except(TypeError, ValueError, OverflowError, User.DoesNotExist):
            user=None

        try:
            if user is not None and account_activation_token.check_token(user, token):
                user.is_mail_authenticated=True
                user.save()
                return Response(user.email + '계정이 활성화 되었습니다.', status=status.HTTP_200_OK)
            else:
                return Response('만료된 링크입니다.', status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            print('error')

#유저 로그인 API
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

#유저 로그아웃 API
class LogoutAPI(APIView):
    def post(self, request):
        logout(request)
        return Response({'message' : '성공적으로 로그아웃되었습니다.'}, status=status.HTTP_200_OK)

#전체 유저 목록 출력하는 API
class AllUserAPI(generics.ListAPIView):
    #permission_classes = [permissions.IsAuthenticated]
    serializer_class = UserSerializer
    queryset = User.objects.all()

#접속 유저 목록 출력하는 API
class UserAPI(generics.RetrieveAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = UserSerializer

    def get_object(self):
        return self.request.user

def testAPI(request):
    return render(request, 'account/login.html')