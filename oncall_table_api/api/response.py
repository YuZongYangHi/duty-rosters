#!/usr/bin/env python
# -*- coding: utf-8 -*-

from django.http import JsonResponse


def Response(code: int, msg: str, data: any):
    return JsonResponse({"code": code, "msg": msg, "data": data})


def NotAllowMethodResponse():
    return Response(code=405, msg="method is not allowed", data="")


def BadRequestResponse(msg=None):
    if msg is None:
        msg = "invalid params"
    return Response(code=400, msg=msg, data="")


def ServerErrorResponse(msg):
    return Response(code=500, msg=msg, data="")


def SuccessResponse(data=[]):
    return Response(code=200, msg="success", data=data)

