#!/usr/bin/env python
# -*- coding: utf-8 -*-

from django.urls import path
from api.views import get_oncall_list, oncall_draw_lots, \
    get_user_list, update_oncall_user, reset, delete_user, draw_lots_list, del_oncall_draw_lots

urlpatterns = [
    path('list', get_oncall_list),
    path('draw_lots', oncall_draw_lots),
    path("draw_lots_list", draw_lots_list),
    path("del_oncall_draw_lots", del_oncall_draw_lots),
    path('users', get_user_list),
    path('delete_user', delete_user),
    path('update', update_oncall_user),
    path('reset', reset)
]