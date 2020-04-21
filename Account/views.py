from django.shortcuts import render
from rest_framework import generics, status, permissions
from rest_framework.response import Response
from knox.models import AuthToken # 토큰 기반의 django rest 인증 모듈
from .serializers import UserAccountSerializer, UserSerializer, UserLoginSerializer
from .models import User
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny, IsAuthenticated
from django.http.response import HttpResponse
import json

#이메일 인증에 사용하는 모듈
from django.template.loader import render_to_string
from django.utils.http import urlsafe_base64_decode, urlsafe_base64_encode
from django.core.mail import EmailMessage
from django.utils.encoding import force_bytes, force_text
from .tokens import account_activation_token

#소셜 로그인에 사용하는 모듈
from google.auth.transport import requests
from django.urls import reverse
# Create your views here.

hostIP='localhost:8000' # 호스트 IP, 추후에 수정

class RegistrationAPI(generics.GenericAPIView):
    permission_classes = (AllowAny, )
    serializer_class = UserAccountSerializer

    def post(self, request, *args, **kwargs):
        '''if request.data['password']!=request.data['password_val']: # 프론트엔드에서 처리
            body={"message" : '비밀번호가 일치하지 않습니다.'}
            return Response(body, status=status.HTTP_400_BAD_REQUEST)'''
        print(request.data)
        if 'phone_num' not in request.data.keys():
            request.data['phone_num']=""

        #소셜 로그인이 아닌 경우
        if len(request.data['social_auth'])==0:
            if len(request.data['password'])<7 or len(request.data['password'])>=16: #비밀번호가 7자 이하이거나 16자 이상인 경우
                body={"message" : '비밀번호가 너무 짧거나 너무 깁니다. 8자 이상 15자 이하로 설정해주세요.'}
                return Response(body, status=status.HTTP_400_BAD_REQUEST)

        #소셜 로그인인 경우 이메일 인증 필요없게 수정
        else :
            request.data['is_mail_authenticated'] = True

        serializer=UserAccountSerializer(data=request.data)
        if serializer.is_valid():
            user=serializer.save()

            if 'is_mail_authenticated' not in request.data.keys(): # 소셜 로그인이 아닐 경우, 이메일 인증을 수행한다. 이메일 인증 유효기간은
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
        print('request ' + str(serializer))
        if serializer.is_valid():
            user=serializer.validated_data
            return Response(
                {
                    "token" : AuthToken.objects.create(user)[1],
                }
            )
        return Response(serializer.errors, status=status.HTTP_401_UNAUTHORIZED)

#전체 유저 목록 출력하는 API
class AllUserAPI(generics.ListAPIView):
    serializer_class = UserSerializer
    queryset = User.objects.all()

#특정 접속 유저의 프로필을 출력하거나, 회원에서 제거하는 API
class UserAPI(generics.GenericAPIView):
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated, ]
    def get(self, request, pk):
        user=User.objects.get(pk=pk)

        return Response(UserSerializer(user).data, status=status.HTTP_200_OK)

    def delete(self, request, pk):
        req_user=User.objects.get(username=request.data['username'])
        user = User.objects.get(pk=pk)

        # 다른 사용자의 계정을 지우려고 시도하는 경우 에러 발생시키기
        if req_user != user:
            return Response({"message : " : "권한이 없습니다."}, status=status.HTTP_401_UNAUTHORIZED)
        
        #자신의 계정을 삭제하려 할경우 정상적으로 삭제
        user.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

class GoogleLoginAPI(APIView):
    def post(self, request):
        payload={'access_token': request.data.get('token')}
        r=requests.get('https://www.googleapis.com/oauth2/v2/userinfo', params=payload)
        data=json.loads(r.text)

        if 'error' in data:
            content = {'message' : 'wrong google token / this google token is already expired.'}
            return Response(content, status=status.HTTP_400_BAD_REQUEST)

        try:
            user=User.objects.get(email=data['email'])
        except User.DoesNotExist:
            return Response({'message' : 'User does not exist.'})
            '''user=User()
            user.username'''

        token=RefreshToken.for_user(user)
        response={}
        response['username']=user.username
        response['access_token']=str(token.access_token)
        response['refresh_token']=str(token)
        return Response(response)

#페북 로그인 테스트용
app_id = 223963862279583
app_secret='719aa00d499b274add701bebe3bfc4d0'

def index(request):
    context={
        'app_id' : app_id,
    }

    return render(request, 'account/fbLoginTest.html', context)

import requests as re2
def login(request):
    code = request.GET['code']
    redirect_uri = f"{request.scheme}://{request.META['HTTP_HOST']}{reverse('login_fb')}"
    url_access_token = "https://graph.facebook.com/v2.11/oauth/access_token"

    params_access_token = {
        "client_id": app_id,
        "redirect_uri": redirect_uri,
        "client_secret": app_secret,
        "code": code,
    }

    response = re2.get(url_access_token, params=params_access_token)
    access_token=response.json()['access_token']
    url_debug_token = 'https://graph.facebook.com/debug_token'
    params_debug_token = {
        "input_token": response.json()['access_token'],
        "access_token": f'{app_id}|{app_secret}'
    }

    url_user_info = 'https://graph.facebook.com/me'
    user_info_fields = [
        'id',  # 아이디
        'first_name',  # 이름
        'last_name',  # 성
        'picture',  # 프로필 사진
        'email',  # 이메일
    ]
    params_user_info = {
        "fields": ','.join(user_info_fields),
        "access_token": access_token
    }
    user_info = re2.get(url_user_info, params=params_user_info)

    return HttpResponse(user_info.json().items())