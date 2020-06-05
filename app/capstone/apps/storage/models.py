import uuid, os

from pathlib import PurePosixPath, Path

from django.conf import settings
from django.db import models
from django.utils import timezone

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
    in_recycle = models.BooleanField(default=False)


    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=['parent', 'name'],
                condition=models.Q(parent__isnull=False),
                name="unique_name_within_directory",
            ),
        ]


class Directory(DirectoryEntry):
    @staticmethod
    def get_by_path_or_id(user, path_or_id, match_user_on_id=True):
        '''
        Get directory either by path or id, depending on what input looks like.
        The return value is a pair (n, directory) which is mostly compatible with
        `get_by_path`; Exact match (either by path or id) will always result in
        n == 0. In case where `path_or_id` was an id and no match was found, the
        return value will be (None, None).
        '''
        if path_or_id.startswith('/'):
            # Path.
            return Directory.get_by_path(user, path_or_id)
        # Id.
        try:
            query = Directory.objects.filter(pk=path_or_id)
            if match_user_on_id:
                directory = query.get(owner=user)
            else:
                directory = query.get()
        except Directory.DoesNotExist:
            return (None, None)
        return (0, directory)

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

        Also note that this function ignores anything that isn't a directory.
        Using the above example, if "d" is a file, the return value will still
        be the same since "d" isn't a directory and thus is ignored.

        Arguments:
        user -- user to be checked; Should match settings.AUTH_USER_MODEL.
        path -- a path-like object specifying a POSIX path to check.
                If relative, considered as relative-from-root.
        '''
        path = PurePosixPath(path)
        parts = iter(path.parts)
        if path.is_absolute():
            next(parts)  # discard first item

        current_dir = UserStorage.objects.filter(user=user).select_related('root_dir').get().root_dir

        for (i, part) in enumerate(parts):
            try:
                next_dir = current_dir.children.get(name__exact=part).directory
            except (DirectoryEntry.DoesNotExist, Directory.DoesNotExist):
                return (len(parts) - i, current_dir)
            current_dir = next_dir
        return (0, current_dir)

    '''
    class Meta:
        constraints = [
            models.UniqueConstraint(
               fields=['owner'],
               condition=models.Q(parent__isnull=True),
               name='one_root_per_user',
            ),
        ]
    '''


class File(DirectoryEntry):
    '''Metadata of complete uploaded file.'''
    size = models.BigIntegerField()
    uploaded_at = models.DateTimeField(auto_now_add=True)
    has_thumbnail = models.BooleanField(default=False)


    '''
    class Meta:
        constraints = [
            models.CheckConstraint(
                check=models.Q(parent__isnull=False),
                name='file_has_parent_directory',
            ),
        ]
    '''

    def path(self):
        '''The path this file is saved to in the server filesystem.'''
        if os.path.dirname(os.getcwd()) != '/':  # on develop.
            print(str(os.path.dirname(os.getcwd())))
            print("for develop!, path : ", Path(
                str(os.path.dirname(os.getcwd())) + settings.COMPLETE_UPLOAD_PATH,
                str(self.owner.pk),
                str(self.pk)
            ))
            return Path(
                str(os.path.dirname(os.getcwd())) + settings.COMPLETE_UPLOAD_PATH,
                str(self.owner.pk),
                str(self.pk)
            )

        else: # on docker.
            return Path(
                settings.COMPLETE_UPLOAD_PATH,
                str(self.owner.pk),
                str(self.pk)
            )

    def thumbnail_path(self):
        '''
        The path to thumbnail of this file.
        This file may not actually have a thumbnail; As in, has_thumbnail is not checked.
        '''
        if os.path.dirname(os.getcwd()) != '/':  # on develop.
            return Path(
                str(os.path.dirname(os.getcwd())) + settings.THUMBNAIL_PATH,
                str(self.owner.pk),
                str(self.pk)
            )
        else: # on docker.
            return Path(
                settings.THUMBNAIL_PATH,
                str(self.owner.pk),
                str(self.pk)
            )


class PartialUpload(DirectoryEntry):

    size = models.BigIntegerField()
    received_bytes = models.BigIntegerField(default=0)
    last_receive_time = models.DateTimeField(auto_now=True)

    def __init__(self, *args, **kwargs):
        super(PartialUpload, self).__init__(*args, **kwargs)
        self.is_completed = False

    def is_expired(self):
        now = timezone.now()
        time_since_upload = now - self.last_receive_time
        return time_since_upload > settings.PARTIAL_UPLOAD_EXPIRE

    def file_path(self):
        if os.path.dirname(os.getcwd()) != '/':  # on develop.
            return Path(
                str(os.path.dirname(os.getcwd())) + settings.PARTIAL_UPLOAD_PATH, str(self.pk)
            )
        else: # on docker.
            return Path(settings.PARTIAL_UPLOAD_PATH, str(self.pk))

    def complete(self):
        partial_path = self.file_path()  # self.delete()가 실행될 때 file_path 정보가 소실되므로, 미리 저장해둔뒤 사용한다.
        self.is_completed = True
        self.delete()

        file_record = File.objects.create(
            owner=self.owner,
            name=self.name,
            parent=self.parent,
            size=self.size,
        )

        path = file_record.path()
        path.parent.mkdir(mode=0o755, parents=True, exist_ok=True)
        partial_path.rename(path)
        return file_record

    # When PartialUpload is deleted, some clean ups are required;
    # The user's file capacity needs to be bumped back up, and the
    # temporary file needs to be deleted.
    # This is handled by pre_delete hook placed in signals.py,
    # which is loaded by apps.py.

    '''
    class Meta:
        constraints = [
            models.CheckConstraint(
                check=models.Q(parent__isnull=False),
                name='partial_upload_has_parent_directory',
            ),
        ]
    '''


class RecycleEntry(models.Model):
    entry = models.OneToOneField(
        DirectoryEntry,
        related_name='+',
        primary_key=True,
        on_delete=models.CASCADE,
    )
    former_parent = models.ForeignKey(
        Directory,
        related_name='+',
        null=True,
        on_delete=models.SET_NULL,
    )


class UserStorage(models.Model):
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="root_info",
        primary_key=True,
    )
    root_dir = models.OneToOneField(
        Directory,
        # Actually PROTECT is preferable here, since we want to make sure
        # root directory doesn't get deleted by mistake. But that seems to
        # cause problem when the user itself gets deleted; Root directory seems
        # to be deleted before UserStorage, when it's still protecting it, leading
        # to ProtectedError. Attempt to somewhat control this via pre_delete signal
        # on AUTH_USER_MODEL failed; Despite the signal handler, removal of root
        # still happens first. My Google-fu on this topic has failed me.
        # Gotta leave this as-is, until someone figures it out.
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
        default=5 * 1024 * 1024 * 1024,  # 5GiB
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

    def add(self, file_size_sum, file_count=0, dir_count=0): #file_count 값에 dir_count 값이 포함되는 문제가 생겨 file_count 값을 1에서 0으로 수정했습니다.
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