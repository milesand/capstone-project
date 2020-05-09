from django.db import transaction
from django.db.models.signals import post_delete
from django.dispatch import receiver

from .models import UserStorageCapacity, PartialUpload

@receiver(post_delete, sender=PartialUpload)
def delete_partial_upload(sender, instance, using, **kwargs):
    if not instance.is_complete:

        # Delete the partial file.
        instance.file_path().unlink()

        # Bump up the user's storage capacity.
        with transaction.atomic():
            # If partial upload exists, then its uploader must have requested an upload,
            # which would have created the UserStorageCapacity object for the user.
            # Thus, the UserStorageCapacity object is sure to exist.
            storage = UserStorageCapacity.objects.get(user=instance.uploader)
            storage.capacity_left += instance.file_size
            storage.save()