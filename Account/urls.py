from django.urls import path
from .views import RegistrationAPI, LoginAPI, UserAPI
urlpatterns=[
    path("auth/register", RegistrationAPI.as_view()),
    path("auth/login", LoginAPI.as_view()),
    path("auth/users", UserAPI.as_view()),
]