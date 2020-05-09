from django.contrib import admin
from .models import UserStorageCapacity, PartialUpload

# Register your models here.

admin.site.register(UserStorageCapacity)
admin.site.register(PartialUpload)
