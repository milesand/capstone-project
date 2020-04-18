from django.urls import path
from .views import RegistrationAPI, LoginAPI, AllUserAPI, UserAPI, ActivateUserAPI, LogoutAPI, testAPI
urlpatterns=[
    path('test', testAPI),
    path("register", RegistrationAPI.as_view()),
    path("login/", LoginAPI.as_view()),
    path("logout", LogoutAPI.as_view()),
    path("user", UserAPI.as_view()),
    path("all-users", AllUserAPI.as_view()),
    path("activate/<str:uidb64>/<str:token>", ActivateUserAPI.as_view(), name='activate'),
]