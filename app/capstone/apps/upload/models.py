from datetime import datetime, timedelta, timezone
from pathlib import Path

from django.conf import settings
from django.db import models
from djongo import models as mongo_models

PARTIAL_UPLOAD_EXPIRE = timedelta(minutes=30)

class UserStorageCapacity(models.Model):
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        primary_key=True,
    )

    # A 63-bit positive number can represent up to 8 * 1024**6 - 1,
    # 8 * 1024**6 bytes equal 8 EiBs, which is (8 *1024)PiB, which is
    # (8 * 1024**2)TiB, which is (8 * 1024**3)GiB.
    # In other words: 64bit signed integer is probably big enough to represent the
    # size of all data we'll store, and thus for representing single-user's
    # storage capacity.
    capacity_left = models.BigIntegerField(
        default=5*1024*1024*1024,  # 5GiB
    )

    # Note: Currently capacity applies to only pure file content, and not file metadatas
    # or directories. We should measure the metadatas too; Those take up storage space too,
    # after all.


class PartialUpload(models.Model):
    _id = mongo_models.ObjectIdField()
    uploader = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
    )
    file_size = models.BigIntegerField()
    received_bytes = models.BigIntegerField(default=0)
    last_receive_time = models.DateTimeField(default=lambda: datetime.now(timezone.utc))
    file_name = models.CharField(max_length=256, default="")

    def __init__(self, *args, **kwargs):
        super(PartialUpload, self).__init__(*args, **kwargs)
        self.is_completed = False

    def is_expired(self):
        now = datetime.now(timezone.utc)
        time_since_upload = now - self.last_receive_time
        return time_since_upload > PARTIAL_UPLOAD_EXPIRE
    
    def file_path(self):
        return Path('/files/partial').joinpath(str(self._id))

    # When PartialUpload is deleted, some clean ups are required;
    # The user's file capacity needs to be bumped back up, and the
    # temporary file needs to be deleted.
    # This is handled by pre_delete hook placed in signals.py,
    # which is loaded by apps.py.