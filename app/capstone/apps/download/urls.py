from django.urls import path
from .views import FileDownloadAPI, FileListAPI
urlpatterns=[
    #/download/<str:id>/<str:file_name>
    path("<str:user_name>/<str:file_name>", FileDownloadAPI.as_view()),
    path("file-list", FileListAPI.as_view())
]