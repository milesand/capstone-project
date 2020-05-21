from datetime import datetime, timezone
from pathlib import Path, PurePosixPath

from django.conf import settings
from django.db import models
from djongo import models as mongo_models

from .exceptions import NotEnoughCapacityException, InvalidRemovalError


class Directory(models.Model):
    _id = mongo_models.ObjectIdField(primary_key=True)
    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
    )
    name = models.CharField(max_length=256)
    parent = models.ForeignKey(
        "self",
        on_delete=models.CASCADE,
        null=True  # Root directories have no parent
    )
    child_dirs = mongo_models.ArrayReferenceField(
        'self',
        on_delete=models.CASCADE,
        related_name='+',  # '+' means no backwards relation for django
    )
    files = mongo_models.ArrayReferenceField(
        'File',
        on_delete=models.CASCADE,
        related_name='+',
    )

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=['parent', 'name'],
                name="unique_directory_name",
                condition=models.Q(parent__isnull=False)
            ),
        ]

    def __str__(self):
        return str(self.pk)


class File(models.Model):
    _id = mongo_models.ObjectIdField(primary_key=True)
    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
    )
    name = models.CharField(max_length=256)
    size = models.BigIntegerField()
    uploaded_at = models.DateTimeField(default=lambda: datetime.now(timezone.utc))
    directory = models.ForeignKey(
        Directory,
        on_delete=models.CASCADE,
    )

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=['directory', 'name'],
                name="unique_file_name",
            ),
        ]


class UserStorage(models.Model):
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        related_name='directory_info', #User 모델에서 참조할 떄 사용할 이름
        on_delete=models.CASCADE,
        primary_key=True,
    )
    root_dir = models.ForeignKey(
        Directory,
        on_delete=models.CASCADE,
    )

    # A 63-bit positive number can represent up to 8 * 1024**6 - 1,
    # 8 * 1024**6 bytes equal 8 EiBs, which is (8 *1024)PiB, which is
    # (8 * 1024**2)TiB, which is (8 * 1024**3)GiB.
    # In other words: 64bit signed integer is probably big enough to represent the
    # size of all data we'll store, and thus for representing single-user's
    # storage capacity.
    capacity = models.BigIntegerField(
        default=5*1024*1024*1024,  # 5GiB
    )

    # Following fields are used to calculate total storage used:
    # * `file_count` is number of files owned by this user.
    # * `dir_count` is number of directories owned by this user (excluding root).
    # * `file_size_total` is the sum of size of all files.
    # Actual used storage space by this user is calculated by:
    # file_count * FILE_METADATA_SIZE + dir_count * DIR_METADATA_SIZE + file_size_total
    # where METADATA_SIZEs are set in django settings.py.
    file_count = models.BigIntegerField(default=0)
    dir_count = models.BigIntegerField(default=0)
    file_size_total = models.BigIntegerField(default=0)

    def space_used(self):
        return (
            self.file_count * settings.FILE_METADATA_SIZE +
            self.dir_count * settings.DIR_METADATA_SIZE +
            self.file_size_total
        )

    def capacity_left(self):
        return max(0, self.capacity - self.space_used())

    def add(self, file_size_sum, file_count=1, dir_count=0):
        additional = (
            file_count * settings.FILE_METADATA_SIZE +
            dir_count * settings.DIR_METADATA_SIZE +
            file_size_sum
        )
        if self.capacity_left() >= additional:
            self.file_count += file_count
            self.dir_count += dir_count
            self.file_size_total += file_size_sum
        else:
            raise NotEnoughCapacityException()

    def remove(self, file_size_sum, file_count=1, dir_count=0):
        if (self.file_size_total >= file_size_sum and
                self.file_count >= file_count and
                self.dir_count >= dir_count):
            self.file_size_total -= file_size_sum
            self.file_count -= file_count
            self.dir_count -= dir_count
        else:
            raise InvalidRemovalError()


class PartialUpload(models.Model):
    _id = mongo_models.ObjectIdField(primary_key=True)
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
        return time_since_upload > settings.PARTIAL_UPLOAD_EXPIRE

    def file_path(self):
        return Path(settings.PARTIAL_UPLOAD_PATH, str(self._id))

    # When PartialUpload is deleted, some clean ups are required;
    # The user's file capacity needs to be bumped back up, and the
    # temporary file needs to be deleted.
    # This is handled by pre_delete hook placed in signals.py,
    # which is loaded by apps.py.
