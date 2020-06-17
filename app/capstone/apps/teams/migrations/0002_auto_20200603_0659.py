# Generated by Django 2.2.12 on 2020-06-03 06:59

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('teams', '0001_initial'),
    ]

    operations = [
        migrations.RenameField(
            model_name='team',
            old_name='invitationList',
            new_name='invitation_list',
        ),
        migrations.RenameField(
            model_name='team',
            old_name='memberList',
            new_name='member_list',
        ),
        migrations.RenameField(
            model_name='team',
            old_name='shareFolders',
            new_name='share_folders',
        ),
        migrations.RenameField(
            model_name='team',
            old_name='teamLeader',
            new_name='team_leader',
        ),
        migrations.RenameField(
            model_name='team',
            old_name='teamLeaderNick',
            new_name='team_leader_nickname',
        ),
        migrations.RenameField(
            model_name='team',
            old_name='teamName',
            new_name='team_name',
        ),
    ]
