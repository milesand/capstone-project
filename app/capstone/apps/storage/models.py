import uuid

from datetime import datetime
from pathlib import PurePosixPath, Path

from django.conf import settings
from django.db import models

from .exceptions import NotEnoughCapacityException, InvalidRemovalError


class DirectoryEntry(models.Model):
    _id = models.UUIDField(primary_key=True, default=uuid.uuid4)
    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
    )
    name = models.CharField(max_length=256)
    parent = models.ForeignKey(
        "Directory",
        on_delete=models.CASCADE,
        related_name='children',
        null=True  # Root directories have no parent
    )

    DIRECTORY = 'D'
    FILE = 'F'
    PARTIAL_UPLOAD = 'P'
    KIND_CHOICES = [
        (DIRECTORY, 'Directory'),
        (FILE, 'File'),
        (PARTIAL_UPLOAD, 'Partial upload'),
    ]
    kind = models.CharField(
        max_length=1,
        choices=KIND_CHOICES,
    )


    def __init__(self, **kwargs):
        if 'kind' in kwargs:
            raise ValueError(
                "'kind' should not be specified in DirectoryEntry; Set it by subclassing DirectoryEntry and setting constant KIND"
            )
        super(DirectoryEntry, self).__init__(**kwargs)
        self.kind = self.KIND


    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=['parent', 'name'],
                condition=models.Q(parent__isnull=False),
                name="unique_name_within_directory",
            ),
        ]


class Directory(DirectoryEntry):

    KIND = DirectoryEntry.DIRECTORY

    @staticmethod
    def get_by_path(user, path):
        '''
        Checks whether directory specified by given `path` exists for
        given `user`.
        
        Return value is a 2-tuple (n, directory) where directory
        is the deepest ancestor found or the found directory, and n is the
        number of directories that were not found.
        So if given path = "/a/b/c/d/e", and "/a/b/c" exists but "d" doesn't,
        This will return `(2, <directory object for /a/b/c>)` since "d" and
        "e" were not found.

        Arguments:
        user -- user to be checked; Should match settings.AUTH_USER_MODEL.
        path -- a path-like object specifying a POSIX path to check.
                If relative, considered as relative-from-root.
        '''
        parts = iter(PurePosixPath(path).parts)
        if path.is_absolute():
            next(parts)  # discard first item

        current_dir = UserStorage.objects.get(user=user).root_dir
        for (i, part) in enumerate(parts):
            try:
                next_dir = current_dir.child_dirs.get(name__exact=part)
            except Directory.DoesNotExist:
                return (len(parts) - i, current_dir)
            current_dir = next_dir
        return (0, current_dir)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=['owner'],
                condition=models.Q(parent__isnull=True),
                name='one_root_per_user',
            ),
            models.CheckConstraint(
                check=models.Q(kind=DirectoryEntry.DIRECTORY),
                name='matching_kind_directory',
            )
        ]


class File(DirectoryEntry):
    '''Metadata of complete uploaded file.'''
    size = models.BigIntegerField()
    uploaded_at = models.DateTimeField(auto_now_add=True)
    has_thumbnail = models.BooleanField(default=False)

    KIND = DirectoryEntry.FILE

    class Meta:
        constraints = [
            models.CheckConstraint(
                check=models.Q(parent__isnull=False),
                name='file_has_parent_directory',
            ),
            models.CheckConstraint(
                check=models.Q(kind=DirectoryEntry.FILE),
                name='matching_kind_file',
            )
        ]

    def path(self):
        '''The path this file is saved to in the server filesystem.'''
        return Path(
            settings.COMPLETE_UPLOAD_PATH,
            str(self.owner.pk),
            str(self.pk),
        )
    
    def thumbnail_path(self):
        '''
        The path to thumbnail of this file.
        This file may not actually have a thumbnail; As in, has_thumbnail is not checked.
        '''
        return Path(
            settings.THUMBNAIL_PATH,
            str(self.owner.pk),
            str(self.pk),
        )


class PartialUpload(DirectoryEntry):

    size = models.BigIntegerField()
    received_bytes = models.BigIntegerField(default=0)
    last_receive_time = models.DateTimeField(auto_now=True)

    KIND = DirectoryEntry.PARTIAL_UPLOAD

    def __init__(self, **kwargs):
        super(PartialUpload, self).__init__(**kwargs)
        self.is_complete = False

    def is_expired(self):
        now = datetime.now()
        time_since_upload = now - self.last_receive_time
        return time_since_upload > settings.PARTIAL_UPLOAD_EXPIRE

    def file_path(self):
        return Path(settings.PARTIAL_UPLOAD_PATH, str(self.pk))

    # When PartialUpload is deleted, some clean ups are required;
    # The user's file capacity needs to be bumped back up, and the
    # temporary file needs to be deleted.
    # This is handled by pre_delete hook placed in signals.py,
    # which is loaded by apps.py.

    class Meta:
        constraints = [
            models.CheckConstraint(
                check=models.Q(parent__isnull=False),
                name='partial_upload_has_parent_directory',
            ),
            models.CheckConstraint(
                check=models.Q(kind=DirectoryEntry.PARTIAL_UPLOAD),
                name='matching_kind_partial_upload',
            )
        ]


class UserStorage(models.Model):
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="root_info",
        primary_key=True,
    )
    root_dir = models.OneToOneField(
        Directory,
        on_delete=models.CASCADE,
        related_name='+'
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
    
    def addable(self, file_size_sum, file_count=1, dir_count=0):
        additional = (
            file_count * settings.FILE_METADATA_SIZE +
            dir_count * settings.DIR_METADATA_SIZE +
            file_size_sum
        )
        return self.capacity_left() >= additional

    def add(self, file_size_sum, file_count=1, dir_count=0):
        if self.addable(file_size_sum, file_count, dir_count):
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

    def __str__(self):
        return str(self.pk)
