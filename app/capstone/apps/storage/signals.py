from django.db import transaction
from django.db.models.signals import post_delete, pre_delete
from django.conf import settings
from django.dispatch import receiver

from .models import UserStorage, PartialUpload, File
from pathlib import Path

import os
@receiver(post_delete, sender=File)
def delete_file(sender, instance, using, **kwargs):
    print('instance : ', instance)
    file_name=str(instance.pk) + os.path.splitext(instance.name)[1]
    if os.path.dirname(os.getcwd()) == '/':  # on docker
        path = str(Path(settings.COMPLETE_UPLOAD_PATH, str(instance.owner), file_name))

    else:  # for test
        path = os.path.dirname(os.getcwd()) + str(
            Path(settings.COMPLETE_UPLOAD_PATH, str(instance.owner), file_name))

    if os.path.isfile(path): # 파일 모델 삭제할 때 서버에 저장된 파일 함께 삭제
        os.remove(path)

    else:
        print("error : file {0} does not exist.".format(instance.name))

    if instance.is_thumbnail: # 썸네일이 존재할 경우 같이 삭제
        file_name=os.path.splitext(file_name)[0] + '.jpg'
        if os.path.dirname(os.getcwd()) == '/':  # on docker
            path = str(Path(settings.COMPLETE_UPLOAD_PATH, str(instance.owner), 'thumbnail', file_name))

        else:  # for test
            path = os.path.dirname(os.getcwd()) + str(
                Path(settings.COMPLETE_UPLOAD_PATH, str(instance.owner), 'thumbnail', file_name))

        if os.path.isfile(path):
            os.remove(path)
        else:
            print("error : thumbnail for file {0} does not exist.".format(instance.name))

    with transaction.atomic(): # 파일 제거했을 때 UserStorage에 저장된 파일 갯수 및 파일 전체 크기 값 조정
        user_storage=instance.directory.userstorage_set.first()
        print(instance, instance.directory, instance.directory.userstorage_set.first())
        if user_storage:
            user_storage.remove(file_size_sum=instance.size, file_count=1)
            user_storage.save()
        print('info save complete!')

    print('file_name : ', file_name, ', path : ', path)

@receiver(post_delete, sender=PartialUpload)
def delete_partial_upload(sender, instance, using, **kwargs):
    print('instance : ', instance)
    if not instance.is_completed:

        # Delete the partial file.
        try:
            instance.file_path().unlink()
        except:
            print("partial file does not exist.")
            return
        # Bump up the user's storage capacity.
        with transaction.atomic():
            # If partial storage exists, then its uploader must have requested an storage,
            # which would have created the UserStorage object for the user.
            # Thus, the UserStorage object is sure to exist.
            storage = UserStorage.objects.get(user=instance.uploader)
            storage.remove(instance.file_size)
            storage.save()
