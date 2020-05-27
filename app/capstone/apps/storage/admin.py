from django.contrib import admin
from .models import DirectoryEntry, Directory, File, PartialUpload

# Register your models here.

admin.site.register(
    [
        DirectoryEntry,
        Directory,
        File,
        PartialUpload,
    ]
)

