from rest_framework import serializers
from django.db import transaction
from .models import UserStorage, Directory, File, PartialUpload

# User 모델에서 루트 디렉터리 및 소유 디렉터리, 파일들의 정보를 참조할 때 사용
class UserStorageSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserStorage
        fields = ('root_dir', 'capacity', 'file_count', 'dir_count', 'file_size_total')


class FileSerializer(serializers.ModelSerializer):
    class Meta:
        model = File
        fields = ('pk', 'size', 'uploaded_at', 'has_thumbnail', 'is_video')

class DirectorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Directory
        fields = ('pk', 'owner', 'name', 'parent')


class PartialSerializer(serializers.ModelSerializer): #테스트용
    class Meta:
        model = PartialUpload
        fields = '__all__'