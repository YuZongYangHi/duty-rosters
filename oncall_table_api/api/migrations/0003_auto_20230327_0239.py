# Generated by Django 3.2.18 on 2023-03-27 02:39

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0002_alter_users_phone'),
    ]

    operations = [
        migrations.AlterField(
            model_name='drawlots',
            name='effective_date',
            field=models.DateTimeField(unique=True, verbose_name='生效时间'),
        ),
        migrations.AlterField(
            model_name='users',
            name='email',
            field=models.EmailField(max_length=254, unique=True, verbose_name='用户邮箱'),
        ),
        migrations.AlterField(
            model_name='users',
            name='phone',
            field=models.PositiveBigIntegerField(unique=True, verbose_name='用户手机号'),
        ),
        migrations.AlterField(
            model_name='users',
            name='username',
            field=models.CharField(max_length=64, unique=True, verbose_name='用户名称'),
        ),
    ]
