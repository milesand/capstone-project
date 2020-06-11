from django.core.management.base import BaseCommand, CommandError
from django.conf import settings
from django.utils import timezone
from capstone.storage.models import PartialUpload

class Command(BaseCommand):
    help = 'Cleans up Uploads that have expired'

    def handle(self, *args, **options):
        now = timezone.now()
        expire_time = now - settings.PARTIAL_UPLOAD_EXPIRE
        PartialUpload.objects.filter(last_receive_time__lt=expire_time).delete()
