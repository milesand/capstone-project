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
import capstone.teams.views as teams

api = [
    path('users', account.AllUserAPI.as_view()),
    path("registration", account.RegistrationAPI.as_view()),
    path("user", account.UserAPI.as_view()), #프로필 확인 및 변경, 회원탈퇴
    path("activate/<str:uidb64>/<str:token>", account.ActivateUserAPI.as_view(), name='activate'),
    path("send-auth-email", account.ResendMailAPI.as_view()),
    path('forgot', account.FindIDPasswordAPI.as_view()),
    path('invitation-list', account.InvitationListAPI.as_view()),

    #JWT 토큰 발급 및 재발급용
    path('jwt-login', account.LoginAPI.as_view()), # JWT 토큰 발급 (로그인)
    path('jwt-refresh', refresh_jwt_token), # JWT 토큰 재발급
    path('jwt-verify', verify_jwt_token), # JWT 토큰이 유효한지 확인

    #소셜 로그인용
    path('social-login', account.SocialLoginAPI.as_view()),

    # httponly cookie로 저장되어 있는 JWT 토큰 제거
    path('logout', account.LogoutAPI.as_view()),

    #유저 전제 삭제용 (테스트용)
    path('deleteAll', account.DeleteAPI.as_view()),

    path('check-password', account.ConfirmPasswordAPI.as_view()),
    path('check-email', account.ConfirmEmailAPI.as_view()),

    # Flow.js를 이용한 업로드
    re_path('upload/flow$', storage.FlowUploadStartView.as_view()),
    re_path('upload/flow/(?P<pk>[0-9a-z-]{36})', storage.FlowUploadChunkView.as_view()),

    # 다운로드
    path("download", storage.FileDownloadAPI.as_view()),

    # 썸네일
    path("thumbnail/<str:file_id>", storage.ThumbnailAPI.as_view()),

    # 디렉토리 관련 기능
    path('mkdir', storage.CreateDirectoryView.as_view()), # 디렉토리 생성
    re_path('directory/(?P<pk>[0-9a-z-]{36})', storage.DirectoryView.as_view()), #특정 디렉토리 관리
    re_path('sharing/(?P<pk>[0-9a-z-]{36})', teams.SharingFolderAPI.as_view()),

    # 파일 관련 기능
    path('file/<str:file_id>', storage.FileManagementAPI.as_view()), # 파일 정보 출력
    path('multi-entry', storage.MultipleEntryAPI.as_view()), # 여러 개의 파일이나 디렉토리를 한번에 삭제할 때 사용.
    path('file-list', storage.FileListAPI.as_view()), # 사용자가 저장중인 전체 파일 출력, 테스트용
    path('partial', storage.PartialAPI.as_view()),  # partial file 목록 출력 및 전체 제거, 테스트용
    re_path('partial/(?P<pk>[0-9a-z-]{36})', storage.PartialDeleteAPI.as_view()),  # 특정 partial file 제거, 업로드 중단할 때 사용
    re_path('preview/(?P<pk>[0-9a-z-]{36})', storage.StreamingAPI.as_view()),  # 이미지 및 동영상 미리보기에 사용하는 URL
    path('replacement', storage.EntryReplacementAPI.as_view()),
    path('search/<str:pk>/<str:keyword>', storage.ItemSearchAPI.as_view()),

    #팀 관련 기능
    path('team', teams.CreateTeamAPI.as_view()),
    path('team-management/<str:teamID>', teams.TeamAPI.as_view()),
    path('team/<str:teamID>/invitation', teams.InvitationAPI.as_view()),
    path('team/<str:teamID>/acceptance', teams.AcceptInvitationAPI.as_view()),
    path('team/<str:teamID>/secession', teams.SecessionAPI.as_view()),
    path('join-team', teams.JoinTeamAPI.as_view()), # 현재 가입중인 팀 목록 출력
    path('search-user/<str:team_pk>/<str:name>', teams.UserSearchAPI.as_view()), # 일부 문자열을 통해 사용자 검색

    path('partial', storage.PartialAPI.as_view()), #partial file 목록 출력 및 전체 제거, 테스트용
    re_path('partial/(?P<pk>[0-9a-z-]{36})', storage.PartialDeleteAPI.as_view()),  # 특정 partial file 제거, 업로드 중단할 때 사용
    re_path('streaming/(?P<pk>[0-9a-z-]{36})', storage.StreamingAPI.as_view()),  # 특정 partial file 제거, 업로드 중단할 때 사용

    path('favorite', storage.FavoriteView.as_view()),
    path('recycle', storage.RecycleBinView.as_view()),
    path('recover', storage.RecoverView.as_view()),
]

urlpatterns = [
    path('admin', admin.site.urls),
    path('api/', include(api)),
]