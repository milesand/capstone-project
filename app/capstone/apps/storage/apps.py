from django.apps import AppConfig

class StorageConfig(AppConfig):
    name = 'capstone.storage'

    def ready(self):
        import capstone.storage.signals