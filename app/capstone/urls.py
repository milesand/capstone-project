"""capstone URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/3.0/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
import sys, os
sys.path.append(os.path.dirname(os.path.abspath(os.path.dirname(__file__))))
from django.contrib import admin
from django.urls import path, re_path, include

from django.contrib.staticfiles.urls import staticfiles_urlpatterns # html 테스트용
from rest_framework_jwt.views import refresh_jwt_token, verify_jwt_token # JWT 토큰 관리에 필요한 모듈

import capstone.account.views as account
import capstone.storage.views as storage
import capstone.download.views as download
import capstone.teams.views as teams

api = [
    path('users', account.AllUserAPI.as_view()),
    path("registration", account.RegistrationAPI.as_view()),
    path("user", account.UserAPI.as_view()),
    path("activate/<str:uidb64>/<str:token>", account.ActivateUserAPI.as_view(), name='activate'),
    path("send-auth-email", account.ResendMailAPI.as_view()),
    path('forgot', account.FindIDPasswordAPI.as_view()),
    path('invitation-list', account.InvitationListAPI.as_view()),

    #JWT 토큰 발급 및 재발급용
    path('jwt-login', account.LoginAPI.as_view()), # JWT 토큰 발급 (로그인)
    path('jwt-refresh', refresh_jwt_token), # JWT 토큰 재발급
    path('jwt-verify', verify_jwt_token), # JWT 토큰이 유효한지 확인

    #httponly cookie로 는 JWT 토큰 제거
    path('logout', account.LogoutAPI.as_view()),
    #소셜 로그인 테스트용
    path('social-login', account.SocialLoginAPI.as_view()),

    #유저 삭제 테스트용
    path('deleteAll', account.DeleteAPI.as_view()),

    # Flow.js를 이용한 업로드
    re_path('upload/flow$', storage.FlowUploadStartView.as_view()),
    re_path('upload/flow/(?P<pk>[0-9a-z-]{36})', storage.FlowUploadChunkView.as_view()),

    # 다운로드
    path("download/<str:user_name>/<str:file_id>", download.FileDownloadAPI.as_view()),
    path("download/file-list", download.FileListAPI.as_view()),

    #팀 관련 기능
    path('team', teams.CreateTeamAPI.as_view()),
    path('team-management/<str:teamID>', teams.TeamAPI.as_view()),
    path('team/<str:teamID>/invitation', teams.InvitationAPI.as_view()),
    path('team/<str:teamID>/acceptance', teams.AcceptInvitationAPI.as_view()),
    path('team/<str:teamID>/secession', teams.SecessionAPI.as_view()),
    path('team/<str:teamID>/sharing', teams.SharingFolderAPI.as_view()),

]

urlpatterns = [
    #path('', include('Account_static.urls')), # 로그인 테스트 페이지
    path('admin', admin.site.urls),
    path('api/', include(api)),
    path('accounts/', include('allauth.urls')),
]

urlpatterns += staticfiles_urlpatterns() # html 테스트용