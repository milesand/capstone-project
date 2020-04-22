from django.urls import path
from knox import views as knox_views
from .views import RegistrationAPI, LoginAPI, AllUserAPI, UserAPI, ActivateUserAPI, GoogleLoginAPI
urlpatterns=[
    path('users', AllUserAPI.as_view()),
    path("register", RegistrationAPI.as_view()),
    path("login", LoginAPI.as_view(), name='login'),
    path("logout", knox_views.LogoutView.as_view(), name = 'logout'),
    path("user/<int:pk>", UserAPI.as_view()),
    path("activate/<str:uidb64>/<str:token>", ActivateUserAPI.as_view(), name='activate'),
    path('google/', GoogleLoginAPI.as_view(), name='google_login'),
]