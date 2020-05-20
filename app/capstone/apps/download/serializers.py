from rest_framework import serializers
from .models import File
from bson.objectid import ObjectId
class FileDownloadSerializer(serializers.ModelSerializer):
    class Meta:
        model=File
        fields=('file_name', )

    def create(self, validated_data):
        file=File.objects.create(
            _id=ObjectId(),
            owner_name=self.context['request'].user.username,
            file_name=validated_data['file_name'],
        )
        return file


class FileSerializer(serializers.ModelSerializer):
    class Meta:
        model=File
        fields='__all__'