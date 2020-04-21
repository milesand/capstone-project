"""Capstone URL Configuration

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
from django.urls import path, include
from Account.views import login


from django.contrib.staticfiles.urls import staticfiles_urlpatterns # html 테스트용
urlpatterns = [
    path('', include('Account_static.urls')), # 로그인 테스트 페이지
    path('fb-login/', login, name='login_fb'),
    path('admin', admin.site.urls),
    path('api/', include('Account.urls')),
    path('api/auth/', include('knox.urls')), # POST api/auth/login : 로그인한 사용자의 토큰 만료기간과 토큰 정보를 얻을 수 있다. GET으로 바꾸기
                                             # POST api/auth/logout : 로그인한 사용자를 로그아웃시킨다.
                                             # POST api/auth/logoutall : 로그인한 모든 사용자 로그아웃
    path('accounts/', include('allauth.urls')),
]

urlpatterns += staticfiles_urlpatterns() # html 테스트용