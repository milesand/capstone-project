from django.contrib import admin
from .models import UserStorage, PartialUpload

# Register your models here.

admin.site.register(UserStorage)
admin.site.register(PartialUpload)
