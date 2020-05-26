from rest_framework import serializers
from .models import UserStorage, File

# User 모델에서 루트 디렉터리 및 소유 디렉터리, 파일들의 정보를 참조할 때 사용
class UserStorageSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserStorage
        fields = ('root_dir', 'capacity', 'file_count', 'dir_count', 'file_size_total')


class FileDownloadSerializer(serializers.ModelSerializer):
    class Meta:
        model = File
        fields = ('owner_name', 'file_name', 'file_path')


class FileSerializer(serializers.ModelSerializer):
    class Meta:
        model = File
        fields = ('pk', 'size', 'uploaded_at', 'has_thumbnail')