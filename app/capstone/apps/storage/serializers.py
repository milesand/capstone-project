from rest_framework import serializers
from .models import UserStorage, File
from bson.objectid import ObjectId

# User 모델에서 루트 디렉터리 및 소유 디렉터리, 파일들의 정보를 참조할 때 사용
class UserStorageSerializer(serializers.ModelSerializer):
    root_dir=serializers.CharField()

    class Meta:
        model=UserStorage
        fields=('root_dir', 'capacity', 'file_count', 'dir_count', 'file_size_total')


class FileDownloadSerializer(serializers.ModelSerializer):
    class Meta:
        model=File
        fields=('owner_name', 'file_name', 'file_path')

class FileSerializer(serializers.ModelSerializer):
    _id=serializers.CharField()
    directory=serializers.CharField()

    class Meta:
        model=File
        fields="__all__"

