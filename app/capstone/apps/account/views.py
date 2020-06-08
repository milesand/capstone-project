from django.conf import settings
from django.shortcuts import get_object_or_404
from django.http import Http404
from rest_framework import generics, status
from rest_framework.response import Response
from .serializers import UserAccountSerializer, UserSerializer, FindIDPasswordSerializer, SocialLoginSerializer, \
    SocialAccessTokenSerializer, UserLoginSerializer, TeamListSerializer, WithdrawalSerializer, ChangeProfileSerializer
from .models import User
from django.contrib.auth import login
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny, IsAuthenticated
import json

# ID/비밀번호 찾기에 쓰는 모듈
import random, datetime
from django.contrib.auth.hashers import make_password

random.seed(datetime.datetime.now())

# 이메일 인증에 사용하는 모듈
from django.template.loader import render_to_string
from django.utils.http import urlsafe_base64_decode, urlsafe_base64_encode
from django.core.mail import EmailMessage
from django.utils.encoding import force_bytes, force_text
from .tokens import account_activation_token

import sys, os

sys.path.append(os.path.dirname(os.path.abspath(os.path.dirname(__file__))))

# 소셜 로그인에 사용하는 모듈
import requests
from capstone.settings.base import SOCIAL_AUTH_FACEBOOK_KEY, SOCIAL_AUTH_FACEBOOK_SECRET
from capstone.teams.models import Team

# JWT 인증에 사용하는 모듈
from rest_framework_jwt.views import ObtainJSONWebToken
from rest_framework_jwt.settings import api_settings

jwt_payload_handler = api_settings.JWT_PAYLOAD_HANDLER
jwt_encode_handler = api_settings.JWT_ENCODE_HANDLER
from capstone.settings.base import JWT_AUTH
from datetime import datetime
from django.contrib.auth import authenticate
import jwt, calendar


# 클라이언트에서 보내준 JWT 토큰을 해독하여 사용자를 식별한다.
def decodeJWTToken(token):
    try:
        return jwt.decode(token, None, None)
    except:
        return jwt.decode(token.data['token'], None, None)


# JWT 토큰 decoding을 통해 유저 정보 획득
def find_user(request):
    payload = decodeJWTToken(request.COOKIES['jwt']);  # JWT payload decoding
    user = get_object_or_404(User, _id=payload['user_id'])
    return user


def sendMail(message, mail_title, to_email):
    email = EmailMessage(mail_title, message, to=[to_email])
    email.send()


# 이메일 전송 API
class ResendMailAPI(generics.GenericAPIView):
    permission_classes = (AllowAny,)

    def get(self, request, *args, **kwargs):
        # user=find_user(request)
        user = request.user
        message = render_to_string('account/user_active_email.html', {
            'username': user.username,
            'domain': request.get_host(),
            'uid': urlsafe_base64_encode(force_bytes(user.pk)).encode().decode(),
            'token': account_activation_token.make_token(user)
        })
        mail_title = 'Moonge drive 회원가입 인증 메일입니다.'
        to_email = user.email  # 인증 메일을 받는 주소
        sendMail(message, mail_title, to_email)
        return Response({"message": "이메일 전송 완료."}, status=status.HTTP_200_OK)


class RegistrationAPI(generics.GenericAPIView):
    permission_classes = (AllowAny,)
    serializer_class = UserAccountSerializer

    support_social_login = ['google', 'facebook']

    def post(self, request, *args, **kwargs):
        print('registration request : ', request.data)

        # 소셜 로그인이 아닌 경우
        if request.data['social_auth'] == '':
            if len(request.data['password']) < 8 or len(request.data['password']) >= 16:  # 비밀번호가 7자 이하이거나 16자 이상인 경우
                body = {"message": '비밀번호가 너무 짧거나 너무 깁니다. 8자 이상 15자 이하로 설정해주세요.'}
                return Response({'message': '비밀번호가 너무 짧습니다.'}, status=status.HTTP_400_BAD_REQUEST);

        else:
            if (request.data['social_auth'] not in self.support_social_login):
                # 지원하는 소셜 로그인이 아닌 경우
                return Response({'message': '잘못된 접근입니다.'}, status=status.HTTP_405_METHOD_NOT_ALLOWED)

            else:  # 지원하는 소셜 로그인
                print('here.')
                try:
                    User.objects.get(email=request.data['email'])  # 기존 가입 유저중에 동일한 이메일을 사용하는 유저가 있을 경우 해당 계정과 연동
                    return Response(status=status.HTTP_202_ACCEPTED)
                except:
                    request.data['is_mail_authenticated'] = True

        serializer = UserAccountSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()  # 여기서 UserAccountSerializer의 create 메소드가 실행된다.
            # 소셜 로그인이 아닐 경우, 이메일 인증을 수행한다.
            if UserSerializer(user)['is_mail_authenticated'].value == False:
                message = render_to_string('account/user_active_email.html', {
                    'username': user.username,
                    'domain': request.get_host(),
                    'uid': urlsafe_base64_encode(force_bytes(user.pk)).encode().decode(),
                    'token': account_activation_token.make_token(user)
                })
                mail_title = 'Moonge drive 회원가입 인증 메일입니다.'  # 인증 메일 제목, 추후에 수정
                to_email = user.email  # 인증 메일을 받는 주소
                sendMail(message, mail_title, to_email)

            payload = jwt_payload_handler(user)
            payload['user_id'] = str(payload['user_id'])
            token = jwt_encode_handler(payload)  # JWT 토큰 생성
            print("가입 완료!")
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
                }  # 가입을 수행한 뒤 확인을 위해 유저 정보 출력
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# 이메일 인증 API
class ActivateUserAPI(APIView):
    permission_classes = (AllowAny,)

    def get(self, request, uidb64, token):
        try:
            pk = force_text(urlsafe_base64_decode(uidb64))
            print("pk : ", pk)
            user = get_object_or_404(User, pk=pk)
        except(TypeError, ValueError, OverflowError):
            return Response({"error": "잘못된 접근입니다."}, status=status.HTTP_403_FORBIDDEN)
        except(Http404):
            return Response({"error": "해당하는 유저를 찾을 수 없습니다."}, status=status.HTTP_410_GONE)  # 사용자 정보가 서버에 없을 경

        if user is not None and account_activation_token.check_token(user, token) and not user.is_mail_authenticated:
            user.is_mail_authenticated = True
            user.save()
            return Response({"username": user.username, 'nickname': user.nickname, "email": user.email, 'rootDir' : str(user.root_info.root_dir.pk)},
                            status=status.HTTP_200_OK)
        else:
            return Response('만료된 링크입니다.', status=status.HTTP_400_BAD_REQUEST)


# JWT 토큰을 얻기 위한 부모 클래스
class GetJWTToken(ObtainJSONWebToken):
    request = None

    # 아이디와 비밀번호를 이용하여 발급받기
    def getToken(self, request):
        self.request = request
        token = self.post(self.request)
        return token

    # 비밀번호를 사용하지 않고 발급받기
    def getToken_without_password(self, user):
        payload = jwt_payload_handler(user)
        if (api_settings.JWT_ALLOW_REFRESH):
            payload['orig_iat'] = calendar.timegm(datetime.utcnow().utctimetuple())

        return jwt_encode_handler(payload)


# 유저 JWT 로그인
class LoginAPI(generics.GenericAPIView):
    serializer_class = UserLoginSerializer
    permission_classes = (AllowAny, )
    def post(self, request):
        if len(request.data['username']) > 15:  # 아이디 15자 이하일 경우, 일반 로그인
            self.serializer_class = SocialLoginSerializer

        serializer = self.serializer_class(data=request.data)
        print('login : ', request.data)
        if serializer.is_valid():
            print("request test.")
            print(request.data)
            # 존재하는 아이디인지 확인
            user = authenticate(username=request.data['username'], password=request.data['password'])
            print("user : ", user)
            response = Response()
            if user is None:
                response.data = {"error": "아이디와 비밀번호를 확인해주세요."}
                response.status = status.HTTP_404_NOT_FOUND
                return response

            g = GetJWTToken()
            token = g.getToken(request)
            response.set_cookie('jwt', token.data['token'], domain=None,
                                expires=datetime.utcnow() + JWT_AUTH['JWT_EXPIRATION_DELTA'],
                                httponly=True)  # httponly cookie를 통해 JWT 토큰 전송
            print("set complete.")
            if user.is_mail_authenticated == False:
                response.data = {"error": "이메일 인증이 필요합니다. 인증을 수행한 뒤 다시 로그인해주세요.", 'nickname': user.nickname,
                                 "email": user.email}
                response.status = status.HTTP_401_UNAUTHORIZED
                return response
            else:
                # response=Response({'id': user._id, 'token': token.data['token']}, status=status.HTTP_200_OK)
                response.data = UserSerializer(user).data
                response.status = status.HTTP_200_OK
                return response
        else:
            return Response({'error': "입력 형식을 확인해주세요."}, status=status.HTTP_400_BAD_REQUEST)


class LogoutAPI(APIView):
    permission_classes = (IsAuthenticated,)

    def post(self, request):
        response = Response({"message": "로그아웃 완료."}, status=status.HTTP_204_NO_CONTENT)
        response.delete_cookie('jwt')
        return response


# 전체 유저 목록 출력하는 API
class AllUserAPI(generics.ListAPIView):
    serializer_class = UserSerializer
    queryset = User.objects.all()

# 특정 접속 유저의 프로필을 출력하거나, 회원에서 제거하는 API
class UserAPI(generics.GenericAPIView):
    permission_classes = (IsAuthenticated, )
    #permission_classes = [AllowAny, ]  # 임시 설정

    def get(self, request):
        # user=find_user(request)
        print('here.')
        user = request.user
        print('user : ', user)
        return Response(self.get_serializer_class()(user).data, status=status.HTTP_200_OK)

    def put(self, request):  # request body : curPassword, newPassword, nickname, phone_num, 안바꿀 값은 빈칸으로
        print("request : ", request.data)
        serializer = self.get_serializer_class()(data=request.data)
        if serializer.is_valid():
            if request.user.social_auth == "":  # 소셜 계정 아닌경우
                user = authenticate(username=request.user.username, password=request.data['curPassword'])
                if user is None:  # 현재 비밀번호가 틀린 경우
                    return Response({"message": "비밀번호가 일치하지 않습니다."}, status=status.HTTP_400_BAD_REQUEST)
            else:  # 소셜 계정
                user = request.user

            if request.data['newPassword']!="":
                user.password=make_password(request.data['newPassword'])

            if request.data['nickname']!="":
                user.nickname=request.data['nickname']

            if request.data['phone_num']!="":
                user.phone_num=request.data['phone_num']

            if request.data['newPassword']=="" and request.data['nickname']=='' and request.data['phone_num']=='':
                return Response({'error' : '변경값을 입력해주세요.'}, status=status.HTTP_400_BAD_REQUEST)

            user.save()
            return Response(status=status.HTTP_204_NO_CONTENT)

        else:
            return Response({'message': '입력 형식을 확인해주세요.'}, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request):
        print("delete call!, request : ", request.data)
        serializer = self.get_serializer_class()(data=request.data)
        if serializer.is_valid():
            if request.user.social_auth=="":
                user = authenticate(username=request.user.username, password=request.data['password'])
                if user is None:
                    return Response({'message : ', "비밀번호가 일치하지 않습니다."}, status=status.HTTP_401_UNAUTHORIZED)
            else: #소셜 계정
                user=request.user

            user.delete()
            return LogoutAPI.post(self, request)

        else:
            return Response({'message': '비밀번호는 15자 이하여야 합니다.'}, status=status.HTTP_400_BAD_REQUEST)

    def get_serializer_class(self):
        if self.request.method=='GET':
            return UserSerializer
        elif self.request.method=='DELETE':
            return WithdrawalSerializer
        else:
            return ChangeProfileSerializer


# 소셜로그인을 수행할 때 여기서 구글인지 페이스북인지 체크한 다음, 적절한 곳으로 POST 명령을 보내준다.
class SocialLoginAPI(RegistrationAPI, LoginAPI, generics.GenericAPIView):
    serializer_class = SocialAccessTokenSerializer
    response = None

    def login_n_registration(self, request, data, social):
        userData = {'username': social + '_' + data['id'],
                    'nickname': data['name'],
                    'password': 'social',
                    'email': data['email'],
                    'is_mail_authenticated': True,
                    'social_auth': social}
        print('userdata : ', userData)
        try:
            user = get_object_or_404(User, username=data['id'])
        except:  # 회원 정보 없음, 회원 가입 진행
            request._full_data = userData
            print("registration result.")
            self.response = RegistrationAPI.post(self, request)
            print(self.response.status_code)  # 해당 이메일로 이미 가입된 아이디가 있을 경우, http code 202 발생

        # 로그인 진행
        print(LoginAPI.serializer_class)
        self.serializer_class = LoginAPI.serializer_class  # serializer class 로그인 용으로 전환
        if self.response is not None and self.response.status_code == 202:
            user = User.objects.get(email=data['email'])
            if user.is_mail_authenticated == False:
                user.is_mail_authenticated = True
                user.save()
            user.backend = 'django.contrib.auth.backends.ModelBackend'
            login(request, user)
            g = GetJWTToken()
            token = g.getToken_without_password(user)
            print('token : ', token)
            response = Response(UserSerializer(user).data, status=status.HTTP_200_OK)
            response.set_cookie('jwt', token, domain=None,
                                expires=datetime.utcnow() + JWT_AUTH['JWT_EXPIRATION_DELTA'],
                                httponly=True)  # httponly cookie를 통해 JWT 토큰 전송

            print("set complete.")
            return response

        else:
            userLoginData = {'username': social + '_' + data['id'],
                             'password': "social"}

            request._full_data = userLoginData
            try:
                return LoginAPI.post(self, request)
            except:
                return Response({'error': '소셜 계정 로그인 실패.'}, status=status.HTTP_400_BAD_REQUEST)

    def post(self, request):
        serializer = self.serializer_class(data=request.data)
        if serializer.is_valid():
            if request.data['social_auth'] == 'facebook':
                return FacebookLoginAPI.post(self, request)
            else:
                return GoogleLoginAPI.post(self, request)
        else:
            return Response({"error": "입력 형식을 확인해주세요."}, status=status.HTTP_400_BAD_REQUEST)


class GoogleLoginAPI(SocialLoginAPI, generics.GenericAPIView):
    def post(self, request):
        print('google login API : ', request.data)
        params = {'access_token': request.data.get("access_token")}  # 구글로 request를 보내기 위한 파라미터 설정
        try:
            r = requests.get('https://www.googleapis.com/oauth2/v2/userinfo', params=params)
        except:
            return Response({"error": "구글 인증 정보가 유효하지 않습니다."}, status=status.HTTP_401_UNAUTHORIZED)

        data = json.loads(r.text)  # response 데이터 JSON으로 변환
        print(data)
        return self.login_n_registration(request, data, 'google')


class FacebookLoginAPI(SocialLoginAPI, generics.GenericAPIView):
    def post(self, request):
        print('facebook request : ', request.data)
        input_token = request.data['access_token']
        access_token = SOCIAL_AUTH_FACEBOOK_KEY + '|' + SOCIAL_AUTH_FACEBOOK_SECRET
        url = 'https://graph.facebook.com/debug_token?input_token=' + input_token + '&access_token=' + access_token
        print('url : ', url)
        try:
            r = requests.get(url)
            data = json.loads(r.text)
            uid = data['data']['user_id']
            print('uid : ', uid)
            url = 'https://graph.facebook.com/' + uid \
                  + '?fields=id,name,first_name,last_name,age_range,link,gender,locale,picture,timezone,updated_time,verified,email&access_token=' \
                  + input_token
            try:
                r = requests.get(url)
                data = json.loads(r.text)
                print("here.")
                return self.login_n_registration(request, data, 'facebook')
            except:
                return Response({'error': '사용자 정보 로드 에러!'}, status=status.HTTP_400_BAD_REQUEST)
        except:
            return Response({'error': 'access token 검증 에러!'}, status=status.HTTP_400_BAD_REQUEST)
        return Response({'message': '전달 완료'}, status=status.HTTP_200_OK)


class FindIDPasswordAPI(generics.GenericAPIView):
    serializer_class = FindIDPasswordSerializer
    permission_classes = (AllowAny,)

    def post(self, request):
        print(request.data)
        serializer = self.serializer_class(data=request.data)
        if serializer.is_valid():
            if request.data['IDorPassword'] == 'id':  # ID 찾기, 메일 안보내도됨.
                try:
                    user = get_object_or_404(User, email=request.data['email'])
                    return Response({"username": user.username}, status=status.HTTP_200_OK)
                except(Http404):
                    return Response({"error": "해당 메일로 가입된 아이디가 없습니다."}, status=status.HTTP_404_NOT_FOUND)

            else:  # 비밀번호 찾기, 메일로 임시 비밀번호 보내야됨.
                try:
                    print(request.data)
                    user = get_object_or_404(User, username=request.data['username'], email=request.data['email'])
                    print(user)
                    cand_list = "0123456789abcdefghijklmnopqrstuvwxyz"
                    rand_password = ""

                    for i in range(8):  # 8자리 랜덤 비밀번호 설정
                        rand_password += cand_list[random.randrange(len(cand_list))]

                    print(rand_password)

                    message = render_to_string('account/password_regeneration_email.html', {
                        'username': user.username,
                        'password': rand_password
                    })
                    mail_title = "Moonge drive 임시 비밀번호를 보내드립니다."
                    to_email = user.email
                    sendMail(message, mail_title, to_email)
                    user.password = make_password(rand_password)
                    user.save()
                    return Response({"message": "완료."}, status=status.HTTP_200_OK)
                except(Http404):
                    return Response({"error": "일치하는 정보가 없습니다."}, status=status.HTTP_404_NOT_FOUND)
                except:
                    return Response({"error": "메일 전송이 실패했습니다."}, status=status.HTTP_503_SERVICE_UNAVAILABLE)
        else:
            return Response({"error": "입력 형식을 확인해주세요."}, status.HTTP_400_BAD_REQUEST)


#현재 초대받은 팀들의 이름을 출력한다.
class InvitationListAPI(generics.ListAPIView):
    serializer_class = TeamListSerializer
    permission_classes = (IsAuthenticated, )

    def get_queryset(self):
        return User.objects.filter(username=self.request.user)

# 개발용 API입니다. 가입 유저 전부 삭제.
class DeleteAPI(APIView):
    def delete(self, request):
        user = User.objects.all()
        user.delete()
        return LogoutAPI.post(self, request)

class ConfirmPasswordAPI(APIView):
    def post(self, request):
        user=authenticate(username=request.user.username, password=request.data['password'])
        if user is not None:
            return Response(status=status.HTTP_200_OK)
        else:
            return Response(status=status.HTTP_400_BAD_REQUEST)

class ConfirmEmailAPI(APIView):
    def post(self, request):
        user=User.objects.get(username=request.user.username, email=request.data['email'])
        if user == request.user:
            return Response(status=status.HTTP_200_OK)
        else:
            return Response(status=status.HTTP_400_BAD_REQUEST)


