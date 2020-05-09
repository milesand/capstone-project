from django.urls import path
from .views import FlowUploadStartView, FlowUploadChunkView

urlpatterns = [
    path('flow', FlowUploadStartView.as_view()),
    path('flow/<str:id>', FlowUploadChunkView.as_view()),
]