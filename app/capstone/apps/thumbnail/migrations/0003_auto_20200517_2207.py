# Generated by Django 2.2.12 on 2020-05-17 13:07

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('capstone.thumbnail', '0002_auto_20200517_2144'),
    ]

    operations = [
        migrations.AlterField(
            model_name='item',
            name='image',
            field=models.ImageField(upload_to='uploads/'),
        ),
    ]