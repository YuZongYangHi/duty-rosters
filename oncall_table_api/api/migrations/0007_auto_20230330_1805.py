# Generated by Django 3.2.18 on 2023-03-30 18:05

import datetime
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0006_users_create_time'),
    ]

    operations = [
        migrations.AddField(
            model_name='oncallschedule',
            name='src_user_id',
            field=models.IntegerField(default=0, verbose_name='原值班用户id'),
        ),
        migrations.AlterField(
            model_name='users',
            name='create_time',
            field=models.DateTimeField(default=datetime.datetime(2023, 3, 30, 18, 5, 15, 758202), verbose_name='创建时间'),
        ),
    ]