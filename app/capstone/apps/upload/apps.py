from django.apps import AppConfig

class UploadConfig(AppConfig):
    name = 'capstone.upload'

    def ready(self):
        import capstone.upload.signals