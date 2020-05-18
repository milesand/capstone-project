from django.db import models

# Create your models here.

class KitTest(models.Model):
    path=models.CharField(max_length=200)