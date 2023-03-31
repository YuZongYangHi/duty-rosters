#!/usr/bin/env python
# -*- coding: utf-8 -*-

import json
import time
from django.conf import settings
from api.oncall import OncallManager
from api.response import Response, NotAllowMethodResponse, \
    BadRequestResponse, ServerErrorResponse, SuccessResponse

from dateutil.parser import parse

'''
    args:
        date: 2023-03
    response:
    [
        {
            'date': '2023-03-01',
            'username': 'ellison',
            'name': '艾立森',
            'email': 'ellison@gmail.com',
            'phone': 19999999999
        }
    ]
'''


def get_oncall_list(request):
    if request.method != "GET":
        return NotAllowMethodResponse()

    date = request.GET.get("date", None)
    if parse(settings.INIT_QUERY_DATE) >= parse(date):
        return BadRequestResponse("超出历史查询日期: range(%s ~ future)" % settings.INIT_QUERY_DATE)
    if date is None:
        date = time.strftime('%Y-%m', time.localtime(time.time()))
    o = OncallManager()
    return SuccessResponse(o.get_oncall_list(date))



'''
    args:  
        oncall_date: str
        oncall_user: str
'''


def update_oncall_user(request):
    if request.method != "POST":
        return NotAllowMethodResponse()

    data = json.loads(request.body)
    """
    src_user_id: value.src_user_id,
    new_user_id: value.user_id,
    date: value.date
    """
    if len(data.get("date", "")) == 0 or data.get("src_user_id", 0) <= 0 or data.get("new_user_id", None) <=0:
        return BadRequestResponse()
    m = OncallManager()
    print(data["date"], time.strftime('%Y-%m-%d', time.localtime(time.time())), "#####")
    if parse(data["date"]) <= parse(time.strftime('%Y-%m-%d', time.localtime(time.time()))):
        return BadRequestResponse("当天不允许换班")
    ok, msg = m.update_oncall_table(data["date"], data["src_user_id"], data["new_user_id"])
    if not ok:
        return ServerErrorResponse(msg)
    return SuccessResponse("")


'''
    args: 
        user_ids: []int
        effective_date: 2023-05-01
'''


def oncall_draw_lots(request):
    if request.method != 'POST':
        return NotAllowMethodResponse()
    data = json.loads(request.body)
    m = OncallManager()
    ok, msg = m.draw_lots(user_ids=data["user_ids"], effective_date=data["date"], is_random=data["is_random"])
    code = 200
    if not ok:
        code = 500
    return Response(code, msg, "")


def del_oncall_draw_lots(request):
    data = json.loads(request.body)
    m = OncallManager()
    m.del_draw_lots(data)
    return Response(200, "", "")


def get_user_list(request):
    if request.method == 'GET':
        o = OncallManager()
        params = request.GET.dict()
        return Response(code=200, data=o.get_user_list(params), msg="success")
    elif request.method == "POST":
        o = OncallManager()
        params = json.loads(request.body)
        code, msg = o.create_user(params)
        if code > 200:
            if code == 400:
                return BadRequestResponse(msg)
            elif code == 500:
                return ServerErrorResponse(msg)
        return SuccessResponse(data=[])
    return NotAllowMethodResponse()


def delete_user(request):
    if request.method != 'POST':
        return NotAllowMethodResponse()

    o = OncallManager()
    data = json.loads(request.body)
    user_id = data.get("user_id", None)
    if user_id is None:
        return BadRequestResponse()
    o.delete_user(user_id)
    return SuccessResponse("")


def reset(request):
    if request.method != 'POST':
        return NotAllowMethodResponse()
    data = json.loads(request.body)
    if data.get("date", None) is None:
        return BadRequestResponse()
    o = OncallManager()
    ok, msg = o.reset_future(data["date"])
    if not ok:
        return ServerErrorResponse(msg)
    return SuccessResponse()


def draw_lots_list(request):
    o = OncallManager()
    data = o.get_draw_lots_list()
    return SuccessResponse(data=data)
