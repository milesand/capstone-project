from rest_framework import serializers
from .models import KitTest

#django-imagekit
class ThumbSerializer(serializers.ModelSerializer):
    class Meta:
        model=KitTest
        fields="__all__"