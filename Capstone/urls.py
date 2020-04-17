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
from Account.views import RegistrationAPI, UserAPI, LoginAPI, FacebookLogin

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('Account.urls')),
    path('api/auth/', include('knox.urls')),
    path('rest-auth/', include('rest_auth.urls')),
    path('rest-auth/facebook/', FacebookLogin.as_view(), name='facebook_login'),
    path('rest-auth/registration/', include('rest_auth.registration.urls')),
    path('accounts/', include('allauth.urls')),
]
