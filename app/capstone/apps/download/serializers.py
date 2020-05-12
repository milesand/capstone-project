from rest_framework import serializers
from .models import File
from bson.objectid import ObjectId
class FileDownloadSerializer(serializers.ModelSerializer):
    class Meta:
        model=File
        fields=('owner_name', 'file_name', 'file_path')

    def create(self, validated_data):
        file=File.objects.create(
            _id=ObjectId(),
            owner_name=validated_data['owner_name'],
            file_name=validated_data['file_name'],
            file_path=validated_data['file_path']
        )
        return file


class FileSerializer(serializers.ModelSerializer):
    class Meta:
        model=File
        fields='__all__'