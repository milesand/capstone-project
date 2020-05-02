from django.urls import path
from .views import RegistrationAPI, LoginAPI, AllUserAPI, UserAPI, ActivateUserAPI, GoogleLoginAPI
from rest_framework_jwt.views import obtain_jwt_token, refresh_jwt_token, verify_jwt_token # JWT 토큰 관리에 필요한 모듈
urlpatterns=[
    path('users', AllUserAPI.as_view()),
    path("register", RegistrationAPI.as_view()),
    path("user/<str:id>", UserAPI.as_view()),
    path("activate/<str:uidb64>/<str:token>", ActivateUserAPI.as_view(), name='activate'),

    #JWT 토큰 발급 및 재발급용
    path('jwt-login', LoginAPI.as_view()), # JWT 토큰 발급 (로그인)
    path('jwt-refresh', refresh_jwt_token), # JWT 토큰 재발급
    path('jwt-verify', verify_jwt_token), # JWT 토큰이 유효한지 확인

    #구글 JWT 인증 테스트용
    path('rest-auth/google/', GoogleLoginAPI.as_view(), name='google_login'),
]