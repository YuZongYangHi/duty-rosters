#!/usr/bin/env python
# -*- coding: utf-8 -*-

from django.db import models


class DutyStaff(models.Model):
    name = models.CharField(max_length=30, null=True, verbose_name="值班人员名称")
    en_name = models.CharField(max_length=30, null=True, verbose_name="值班人员英文名称")
    email = models.EmailField(null=True, verbose_name="值班人员邮箱")
    phone = models.IntegerField(max_length=11, null=True, verbose_name="值班人员手机号码")

    class Meta:
        db_table = 'duty_staff'


class HistoryDuty(models.Model):
    duty_time = models.DateTimeField(null=True, verbose_name="值班日期")
    duty_name = models.ForeignKey(DutyStaff, on_delete=models.CASCADE, null=True, verbose_name="值班人员ID")

    class Meta:
        db_table = 'history_duty'


class DrawOrder(models.Model):
    draw_time = models.DateTimeField(null=True, verbose_name="抽签时间")
    take_effect_time = models.DateTimeField(null=True, verbose_name="执行时间")
    draw_order = models.CharField(max_length=50, null=True, verbose_name="执行顺序, 这里以人员ID为准1,2,3")
    draw_interval = models.IntegerField(null=True, verbose_name="抽签间隔")

    class Meta:
        db_table = 'draw_order'
