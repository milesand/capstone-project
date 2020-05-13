from django.apps import AppConfig

class UploadConfig(AppConfig):
    name = 'capstone.storage'

    def ready(self):
        import capstone.upload.signals