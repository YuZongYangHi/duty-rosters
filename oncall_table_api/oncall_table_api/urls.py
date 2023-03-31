#!/usr/bin/env python
# -*- coding: utf-8 -*-


from django.urls import path, include

urlpatterns = [
    path('api/v1/oncall/', include("api.urls")),
]
