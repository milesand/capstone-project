from django.urls import path
from .views import RegistrationAPI, LoginAPI, UserAPI, ActivateUserAPI
urlpatterns=[
    path("register", RegistrationAPI.as_view()),
    path("login", LoginAPI.as_view()),
    path("users", UserAPI.as_view()),
    path("activate/<str:uidb64>/<str:token>", ActivateUserAPI.as_view(), name='activate'),
]