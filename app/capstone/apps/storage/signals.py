from django.db import transaction
from django.db.models.signals import post_delete, pre_delete
from django.dispatch import receiver

from .models import UserStorage, PartialUpload, File

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
