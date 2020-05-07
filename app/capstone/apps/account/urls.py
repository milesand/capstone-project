from django.urls import path
from .views import RegistrationAPI, LoginAPI, AllUserAPI, UserAPI, ActivateUserAPI, GoogleLoginAPI, FileAPI, SendMailAPI, LogoutAPI, SocialLoginAPI, DeleteAPI
from rest_framework_jwt.views import refresh_jwt_token, verify_jwt_token # JWT 토큰 관리에 필요한 모듈

urlpatterns=[
    path('users', AllUserAPI.as_view()),
    path("registration", RegistrationAPI.as_view()),
    path("user", UserAPI.as_view()),
    path("activate/<str:uidb64>/<str:token>", ActivateUserAPI.as_view(), name='activate'),
    path("upload", FileAPI.as_view()),
    path("send-auth-email", SendMailAPI.as_view()),

    #JWT 토큰 발급 및 재발급용
    path('jwt-login', LoginAPI.as_view()), # JWT 토큰 발급 (로그인)
    path('jwt-refresh', refresh_jwt_token), # JWT 토큰 재발급
    path('jwt-verify', verify_jwt_token), # JWT 토큰이 유효한지 확인

    #httponly cookie로 는 JWT 토큰 제거
    path('logout', LogoutAPI.as_view()),
    #소셜 로그인 테스트용
    path('google', SocialLoginAPI.as_view()),

    #유저 삭제 테스트용
    path('deleteAll', DeleteAPI.as_view())
]