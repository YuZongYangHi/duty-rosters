# Generated by Django 3.2.18 on 2023-03-27 14:45

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0004_oncallschedule_create_time'),
    ]

    operations = [
        migrations.AddField(
            model_name='oncallschedule',
            name='type',
            field=models.IntegerField(choices=[(0, 'daily'), (1, 'temporary')], default=0, verbose_name='换班情况'),
        ),
    ]
