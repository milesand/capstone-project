from django.db import transaction
from django.db.models.signals import post_delete, pre_delete, post_save
from django.conf import settings
from django.dispatch import receiver

from .models import UserStorage, PartialUpload, Directory, File
from pathlib import Path

import os


@receiver(post_delete, sender=File)
def delete_file(sender, instance, using, **kwargs):
    if os.path.dirname(os.getcwd()) == '/':  # on docker
        path = instance.path()
    else:  # for test
        path = Path(os.path.dirname(os.getcwd()) + str(instance.path()))
    try:
        path.unlink()
    except FileNotFoundError:
        pass

    if instance.has_thumbnail: # 썸네일이 존재할 경우 같이 삭제
        if os.path.dirname(os.getcwd()) == '/':  # on docker
            path = instance.thumbnail_path()
        else:  # for test
            path = Path(os.path.dirname(os.getcwd()) + str(instance.thumbnail_path()))
        try:
            path.unlink()
        except FileNotFoundError:
            pass

    with transaction.atomic(): # 파일 제거했을 때 UserStorage에 저장된 파일 갯수 및 파일 전체 크기 값 조정
        user_storage = UserStorage.objects.using(using).filter(user=instance.owner).select_for_update().get()
        user_storage.remove(instance.size)
        user_storage.save()


@receiver(post_delete, sender=PartialUpload)
def delete_partial_upload(sender, instance, using, **kwargs):
    print('instance : ', instance)
    if not instance.is_complete:

        # Delete the partial file.
        try:
            instance.file_path().unlink()
        except:
            print("partial file does not exist.")
            return
        # Bump up the user's storage capacity.
        with transaction.atomic():
            storage = UserStorage.objects.using(using).filter(user=instance.uploader).select_for_update().get()
            storage.remove(instance.file_size)
            storage.save()


@receiver(post_save, sender=settings.AUTH_USER_MODEL)
def setup_user(sender, instance, created, using, update_fields, **kwargs):
    '''Set up UserStorage and root directory for the user.'''

    if not created:
        return

    root_dir = Directory.objects.using(using).create(
        owner=instance,
        name="",
        parent=None,
    )
    UserStorage.objects.using(using).create(
        user=instance,
        root_dir=root_dir,
    )
