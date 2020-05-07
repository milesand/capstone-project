from django.shortcuts import render
from rest_framework import generics, status, permissions
from rest_framework.response import Response
from .serializers import UserAccountSerializer, UserSerializer, MailSerializer
from .models import User
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny, IsAuthenticated
from django.http.response import HttpResponse
import json

# 이메일 인증에 사용하는 모듈
from django.template.loader import render_to_string
from django.utils.http import urlsafe_base64_decode, urlsafe_base64_encode
from django.core.mail import EmailMessage
from django.utils.encoding import force_bytes, force_text
from .tokens import account_activation_token

# 소셜 로그인에 사용하는 모듈
from google.auth.transport import requests
from allauth.socialaccount.providers.google.views import GoogleOAuth2Adapter
from rest_auth.registration.views import SocialLoginView

# JWT 인증에 사용하는 모
from rest_framework_jwt.views import ObtainJSONWebToken
from rest_framework_jwt.settings import api_settings
jwt_payload_handler=api_settings.JWT_PAYLOAD_HANDLER
jwt_encode_handler = api_settings.JWT_ENCODE_HANDLER
import sys, os
sys.path.append(os.path.dirname(os.path.abspath(os.path.dirname(__file__))))
from capstone.settings.base import JWT_AUTH
from datetime import datetime
from django.contrib.auth import authenticate
import jwt

class GoogleLoginAPI(SocialLoginView):
    adapter_class = GoogleOAuth2Adapter


# Create your views here.

hostIP='localhost'

#클라이언트에서 보내준 JWT 토큰을 해독하여 사용자를 식별한다.
def decodeJWTToken(token):
    try:
        return jwt.decode(token, None, None)
    except:
        return jwt.decode(token.data['token'], None, None)

#JWT 토큰 decoding을 통해 유저 정보 획득
def find_user(request):
    payload = decodeJWTToken(request.COOKIES['jwt']);  # JWT payload decoding
    user = User.objects.get(_id=payload['user_id'])
    return user


class RegistrationAPI(generics.GenericAPIView):
    permission_classes = (AllowAny,)
    serializer_class = UserAccountSerializer

    support_social_login = ['google', 'facebook']

    def post(self, request, *args, **kwargs):
        '''if request.data['password']!=request.data['password_val']: # 프론트엔드에서 처리
            body={"message" : '비밀번호가 일치하지 않습니다.'}
            return Response(body, status=status.HTTP_400_BAD_REQUEST)'''

        if request.data['social_auth']=='google': # google 로그인의 경우 access_token이 request에 포함되어 있으므로 이에 대한 인증을 진행한다.
            print(request.data)

        # 소셜 로그인이 아닌 경우
        if 'social_auth' not in request.data.keys() or request.data['social_auth']=='':
            if len(request.data['password']) < 8 or len(request.data['password']) >= 16:  # 비밀번호가 7자 이하이거나 16자 이상인 경우
                body = {"message": '비밀번호가 너무 짧거나 너무 깁니다. 8자 이상 15자 이하로 설정해주세요.'}
                return Response({'message': '비밀번호가 너무 짧습니다.'}, status=status.HTTP_400_BAD_REQUEST);

        elif 'social_auth' in request.data.key() and (request.data['social_auth'] not in self.support_social_login):
            # 지원하는 소셜 로그인이 아닌 경우

            if request.data['social_auth'] not in self.support_social_login:
                return Response({'message': '잘못된 접근입니다.'}, status=status.HTTP_405_METHOD_NOT_ALLOWED)

        serializer = UserAccountSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()  # 여기서 UserAccountSerializer의 create 메소드가 실행된다.

            # 소셜 로그인이 아닐 경우, 이메일 인증을 수행한다.
            if UserSerializer(user)['is_mail_authenticated'].value == False:
                message = render_to_string('account/user_active_email.html', {
                    'username': user.username,
                    'domain': hostIP,
                    'uid': urlsafe_base64_encode(force_bytes(user.pk)).encode().decode(),
                    'token': account_activation_token.make_token(user)
                })
                mail_title = '사이트 회원가입 인증 메일입니다.'  # 인증 메일 제목, 추후에 수정
                to_email = user.email  # 인증 메일을 받는 주소
                email = EmailMessage(mail_title, message, to=[to_email])
                email.send()

            payload = jwt_payload_handler(user)
            payload['user_id']=str(payload['user_id'])
            token = jwt_encode_handler(payload) #JWT 토큰 생성
            return Response(  # Response(data, status=None, template_name=None, headers=None, content_type=None)
                # data : response를 위한 직렬화된 데이터(만들어놓은 Serailizer 클래스 사용)
                # status : 응답으로 보내는 상태 코드
                # template_name : HTMLRenderer가 선택되어 있을 경우 사용하는 template 이름
                # headers : 응답에 넣을 HTTP 헤더, dictionary 형태
                # content_type : 응답의 content type. 보통 자동적으로 정해진다.
                {
                    "user": UserSerializer(
                        user, context=self.get_serializer_context()
                    ).data,
                    #"token": token.data['token']
                }  # 가입을 수행한 뒤 확인을 위해 유저 정보 출력
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


#이메일 전송 API
class SendMailAPI(generics.GenericAPIView):
    permission_classes = (AllowAny, )

    def get(self, request, *args, **kwargs):
        #user=find_user(request)
        user=request.user
        message = render_to_string('account/user_active_email.html', {
            'username': user.username,
            'domain': hostIP,
            'uid': urlsafe_base64_encode(force_bytes(user.pk)).encode().decode(),
            'token': account_activation_token.make_token(user)
        })
        mail_title = '사이트 회원가입 인증 메일입니다.'  # 인증 메일 제목, 추후에 수정
        to_email = user.email  # 인증 메일을 받는 주소
        email = EmailMessage(mail_title, message, to=[to_email])
        email.send()
        return Response({"message" : "이메일 재전송 완료."}, status=status.HTTP_200_OK)


# 이메일 인증 API
class ActivateUserAPI(APIView):
    permission_classes = (AllowAny,)

    def get(self, request, uidb64, token):
        try:
            pk = force_text(urlsafe_base64_decode(uidb64))
            user = User.objects.get(pk=pk)
            print("testtest.")
            print(user.is_mail_authenticated)
        except(TypeError, ValueError, OverflowError, User.DoesNotExist):
            user = None

        try:
            if user is not None and account_activation_token.check_token(user, token) and not user.is_mail_authenticated:
                print("check.")
                user.is_mail_authenticated = True
                user.save()
                return Response({"username" : user.username, "email" : user.email}, status=status.HTTP_200_OK)
            else:
                return Response('만료된 링크입니다.', status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            print('error')


# 유저 로그인 API
'''class LoginAPI(generics.GenericAPIView):
    serializer_class = UserLoginSerializer
    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        print('request ' + str(serializer))
        if serializer.is_valid():
            user = serializer.validated_data
            return Response(
                {
                    "user": UserSerializer(
                        user, context=self.get_serializer_context()
                    ).data,
                    "token": AuthToken.objects.create(user)[1],
                }
            )
        return Response(serializer.errors, status=status.HTTP_401_UNAUTHORIZED)'''

#유저 JWT 로그인
class LoginAPI(ObtainJSONWebToken):
    def post(self, request, *args, **kwargs):
        #존재하는 아이디인지 확인
        user=authenticate(username=request.data['username'], password=request.data['password'])
        response=Response()
        if user is None:
            response.data={"error" : "아이디와 비밀번호를 확인해주세요."}
            response.status=status.HTTP_404_NOT_FOUND
            return response

        token = super(LoginAPI, self).post(request, *args, **kwargs)
        response.set_cookie('jwt', token.data['token'], domain=None,
                            expires=datetime.utcnow() + JWT_AUTH['JWT_EXPIRATION_DELTA'],
                            httponly=True)  # httponly cookie를 통해 JWT 토큰 전송

        if user.is_mail_authenticated == False:
            response.data={"error": "이메일 인증이 필요합니다. 인증을 수행한 뒤 다시 로그인해주세요.", "email" : user.email}
            response.status=status.HTTP_401_UNAUTHORIZED
            return response
        else:
            #response=Response({'id': user._id, 'token': token.data['token']}, status=status.HTTP_200_OK)
            response.data={'username': user.username, 'email' : user.email}
            response.status=status.HTTP_200_OK
            return response

class LogoutAPI(generics.GenericAPIView):
    permission_classes = (IsAuthenticated, )

    def post(self, request):
        response=Response({"message": "로그아웃 완료."}, status=status.HTTP_204_NO_CONTENT)
        response.delete_cookie('jwt')
        return response

# 전체 유저 목록 출력하는 API
class AllUserAPI(generics.ListAPIView):
    serializer_class = UserSerializer
    queryset = User.objects.all()


# 특정 접속 유저의 프로필을 출력하거나, 회원에서 제거하는 API
class UserAPI(generics.GenericAPIView):
    serializer_class = UserSerializer
    #permission_classes = [IsAuthenticated, ]
    permission_classes = [AllowAny, ] #임시 설정

    def get(self, request):
        #user=find_user(request)
        user=request.user
        print(user)
        if not user.is_authenticated:
            return Response({"error" : "로그인 중이 아닙니다."}, status=status.HTTP_406_NOT_ACCEPTABLE)
        return Response(UserSerializer(user).data, status=status.HTTP_200_OK)

    def delete(self, request):
        #user = find_user(request)
        user=request.user
        if not user.is_authenticated:
            return Response({"error": "로그인 중이 아닙니다."}, status=status.HTTP_400_BAD_REQUEST)
        user.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

#파일 업로드 테스트용
from .serializers import FileSerializer
from .models import File
class FileAPI(generics.GenericAPIView):
    serializer_class = FileSerializer

    def post(self, request):
        print(request.FILES)
        serializer=FileSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({"message" : "success"}, status=status.HTTP_200_OK)
        else:
            return Response({"message" : "failed"}, status=status.HTTP_400_BAD_REQUEST)



'''class GoogleLoginAPI(APIView):
    def post(self, request):
        payload = {'access_token': request.data.get('token')}
        r = requests.get('https://www.googleapis.com/oauth2/v2/userinfo', params=payload)
        data = json.loads(r.text)
        if 'error' in data:
            content = {'message': 'wrong google token / this google token is already expired.'}
            return Response(content, status=status.HTTP_400_BAD_REQUEST)
        try:
            user = User.objects.get(email=data['email'])
        except User.DoesNotExist:
            return Response({'message': 'User does not exist.'})
        token = RefreshToken.for_user(user)
        response = {}
        response['username'] = user.username
        response['access_token'] = str(token.access_token)
        response['refresh_token'] = str(token)
        return Response(response)'''