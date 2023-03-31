#!/usr/bin/env python
# -*- coding: utf-8 -*-
import datetime
from django.db import models
from django.utils import timezone


class Users(models.Model):
    username = models.CharField(
        unique=True,
        max_length=64,
        null=False,
        blank=False,
        verbose_name="用户名称"
    )
    name = models.CharField(
        max_length=64,
        null=False,
        blank=False,
        verbose_name="中文名称"
    )
    email = models.EmailField(
        verbose_name="用户邮箱",
        null=False,
        blank=False,
        unique=True
    )
    phone = models.PositiveBigIntegerField(
        verbose_name="用户手机号",
        null=False,
        blank=False,
        unique=True
    )
    create_time = models.DateTimeField(
        default=timezone.now(),
        verbose_name="创建时间"
    )

    @property
    def is_valid_phone(self) -> bool:
        return True if len(self.phone) == 11 else False

    class Meta:
        db_table = "users"


class DrawLots(models.Model):
    draw_lots_user_ids = models.TextField(
        verbose_name="抽签用户id列表",
        blank=False,
        null=False
    )
    draw_lots_date = models.DateTimeField(
        verbose_name="抽签时间",
        auto_now_add=True,
    )

    effective_date = models.DateTimeField(
        verbose_name="生效时间",
        null=False,
        blank=False,
        unique=True
    )

    @property
    def get_user_ids(self) -> int:
        return self.draw_lots_user_ids.split(",")

    def current_date_gte_effective_date(self, current_date: str) -> bool:
        return False

    def current_date_lte_effective_date(self, current_date: str) -> bool:
        return True

    class Meta:
        db_table = 'draw_lots'


class OnCallSchedule(models.Model):
    _on_call_type = (
        (0, "daily"),
        (1, "temporary")
    )
    user = models.ForeignKey(
        to="Users",
        on_delete=models.DO_NOTHING,
        verbose_name="用户"
    )
    on_call_date = models.DateTimeField(
        verbose_name="值班时间",
        null=False,
        blank=False
    )
    create_time = models.DateTimeField(
        verbose_name="创建时间",
        default=timezone.now
    )
    type = models.IntegerField(
        choices=_on_call_type, default=0,
        verbose_name="换班情况"
    )
    src_user_id = models.IntegerField(
        verbose_name="原值班用户id",
        default=0
    )

    class Meta:
        db_table = 'on_call_schedule'
