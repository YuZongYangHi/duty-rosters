# Generated by Django 3.2.18 on 2023-03-30 10:36

import datetime
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0005_oncallschedule_type'),
    ]

    operations = [
        migrations.AddField(
            model_name='users',
            name='create_time',
            field=models.DateTimeField(default=datetime.datetime(2023, 3, 30, 10, 36, 11, 605280), verbose_name='创建时间'),
        ),
    ]
