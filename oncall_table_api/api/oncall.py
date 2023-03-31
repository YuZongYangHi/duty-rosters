#!/usr/bin/env python
# -*- coding: utf-8 -*-

import time
import random
import datetime
import calendar

import django.db
from dateutil.parser import parse
from datetime import timedelta
from api.models import Users, OnCallSchedule, DrawLots


class scheduler:
    def __init__(self, month: str):
        # 月份
        self.month = month

    @staticmethod
    def get_next_draw_lots_id(draw_list, position):
        if len(draw_list) <= position:
            position = 0
        return position, draw_list[position]

    @staticmethod
    def get_month_dates(date_str: str):
        # 将日期字符串转换为datetime对象
        date_obj = datetime.datetime.strptime(date_str, '%Y-%m')

        # 获取年份和月份
        year = date_obj.year
        month = date_obj.month

        # 获取该月份的天数
        _, num_days = calendar.monthrange(year, month)

        # 生成该月份的所有日期
        dates = []
        for day in range(1, num_days + 1):
            date = datetime.date(year, month, day)
            dates.append(date.strftime('%Y-%m-%d'))

        return dates

    @staticmethod
    def get_draw_lots_by_effective(date: datetime) -> DrawLots:
        return DrawLots.objects.filter(
            effective_date__lte=date
        ).last()

    @staticmethod
    def gen_oncall_info(future_obj, day):
        data = {
            "user_id": future_obj.user.id,
            "username": future_obj.user.username,
            "name": future_obj.user.name,
            "email": future_obj.user.email,
            "phone": future_obj.user.phone,
            "date": day,
            "type": future_obj.type,
            "src_user_id": future_obj.src_user_id,
            "src_user_name": None,
            "src_user_username": None
        }
        if future_obj.src_user_id > 0:
            src_user = Users.objects.filter(id=future_obj.src_user_id).first()
            data["src_user_name"] = src_user.name
            data["src_user_username"] = src_user.username
        return data

    @staticmethod
    def get_dates_between(start_date_str, end_date_str):
        start_date = datetime.datetime.strptime(start_date_str, "%Y-%m-%d")
        end_date = datetime.datetime.strptime(end_date_str, "%Y-%m-%d")
        dates = [start_date + timedelta(days=x) for x in range((end_date - start_date).days + 1)]
        date_strings = [date.strftime("%Y-%m-%d") for date in dates]
        return date_strings

    @staticmethod
    def calculate_future_data(day, user_obj):
        return {
            "user_id": user_obj.id,
            "username": user_obj.username,
            "name": user_obj.name,
            "email": user_obj.email,
            "phone": user_obj.phone,
            "date": day,
            "type": 0,
            "src_user_id": 0,
            "src_user_name": None,
            "src_user_username": None
        }

    def calculate_history_data(self, day, user_obj):
        history_oncall_obj = OnCallSchedule.objects.filter(
            on_call_date=day
        ).first()

        if not history_oncall_obj:
            OnCallSchedule(
                user=user_obj,
                on_call_date=day,
            ).save()
        obj = OnCallSchedule.objects.filter(on_call_date=day).first()
        return self.gen_oncall_info(obj, day)

    def on_call_list(self):
        days = self.get_month_dates(self.month)

        if len(days) == 0:
            return []
        result = []

        history_first_day_obj = parse("%s %s" % (days[0], "00:00:00"))
        first_draw_lots_time = ""
        history_last_draw_lots = None
        history_filter_draw_lots_day = history_first_day_obj

        history_last_on_call = OnCallSchedule.objects.filter(
            on_call_date__lte=history_first_day_obj
        ).order_by("on_call_date").last()

        # 如果有历史记录
        if history_last_on_call:
            first_draw_lots_user_id = history_last_on_call.user.id
            first_draw_lots_time = history_last_on_call.on_call_date.strftime("%Y-%m-%d")

            history_last_draw_lots = DrawLots.objects.filter(
                effective_date__lte=history_last_on_call.on_call_date
            ).order_by("effective_date").last()

        else:
            history_last_draw_lots = DrawLots.objects.filter(
                effective_date__lte=history_first_day_obj
            ).order_by("effective_date").last()
            first_draw_lots_time = history_last_draw_lots.effective_date.strftime("%Y-%m-%d")

        first_draw_lots_user_ids = [int(i) for i in history_last_draw_lots.draw_lots_user_ids.split(',')]
        first_draw_lots_user_id = first_draw_lots_user_ids[0]

        if history_last_on_call and history_last_on_call.type == 1:
            _draw_lots = DrawLots.objects.filter(
                effective_date__lte=history_last_on_call.on_call_date
            ).order_by("effective_date").last()

            _interval_day_list = self.get_dates_between(_draw_lots.effective_date.strftime("%Y-%m-%d"),
                                                        history_last_on_call.on_call_date.strftime("%Y-%m-%d"))
            _draw_lots_ids = [int(i) for i in _draw_lots.draw_lots_user_ids.split(',')]
            _index = 0
            for _ in range(len(_interval_day_list) - 1):
                _index += 1
                if _index == len(_draw_lots_ids):
                    _index = 0
            first_draw_lots_user_id = _draw_lots_ids[_index]

        history_day_interval_list = self.get_dates_between(first_draw_lots_time, days[0])

        position = first_draw_lots_user_ids.index(first_draw_lots_user_id)
        history_day_interval_list.pop()

        today = parse(time.strftime('%Y-%m-%d %H:%M:%S', time.localtime(time.time())))

        for history_day in history_day_interval_list:
            _history_db_on_call_obj = OnCallSchedule.objects.filter(
                on_call_date=parse(history_day)
            ).first()
            if _history_db_on_call_obj:
                first_draw_lots_user_id = first_draw_lots_user_ids.index(_history_db_on_call_obj.user.id)
                position = first_draw_lots_user_ids[first_draw_lots_user_id]
                continue

            interval_draw_lots = DrawLots.objects.filter(
                effective_date__lte=parse(history_day)
            ).order_by("effective_date").last()
            if interval_draw_lots and interval_draw_lots.id != history_last_draw_lots.id:
                history_last_draw_lots = interval_draw_lots
                first_draw_lots_user_ids = [int(i) for i in history_last_draw_lots.draw_lots_user_ids.split(',')]
                first_draw_lots_user_id = first_draw_lots_user_ids[0]
                position = 0
            position, first_draw_lots_user_id = self.get_next_draw_lots_id(first_draw_lots_user_ids, position)
            position += 1

        for current in days:
            d = parse("%s 00:00:00" % current)
            db_on_call_obj = OnCallSchedule.objects.filter(
                on_call_date=d
            ).first()
            if db_on_call_obj:
                result.append(self.gen_oncall_info(db_on_call_obj, current))
                _draw_lots = DrawLots.objects.filter(effective_date=d).first()
                if _draw_lots:
                    history_last_draw_lots = _draw_lots
                    first_draw_lots_user_ids = [int(i) for i in history_last_draw_lots.draw_lots_user_ids.split(',')]
                    first_draw_lots_user_id = first_draw_lots_user_ids[0]
                    position = 1
                else:
                    position += 1
                continue
            interval_draw_lots = DrawLots.objects.filter(
                effective_date__lte=d
            ).order_by("effective_date").last()
            if interval_draw_lots and interval_draw_lots.id != history_last_draw_lots.id:
                history_last_draw_lots = interval_draw_lots
                first_draw_lots_user_ids = [int(i) for i in history_last_draw_lots.draw_lots_user_ids.split(',')]
                first_draw_lots_user_id = first_draw_lots_user_ids[0]
                position = 0
            position, first_draw_lots_user_id = self.get_next_draw_lots_id(first_draw_lots_user_ids, position)
            user_obj = Users.objects.filter(id=first_draw_lots_user_id).first()
            if today >= d:
                on_call = OnCallSchedule(
                    user=user_obj,
                    on_call_date=d,
                    type=0
                )
                on_call.save()
                result.append(self.gen_oncall_info(on_call, current))
            else:
                result.append(self.calculate_future_data(current, user_obj))
            position += 1
        return result


class OncallManager:

    def __init__(self):
        self.limit = 3

    @staticmethod
    def del_draw_lots(data):
        d = DrawLots.objects.filter(id=data["id"]).first()
        if d:
            if parse(d.effective_date.strftime('%Y-%m-%d')) <= parse(time.strftime('%Y-%m-%d', time.localtime(time.time()))):
                return
        d.delete()

    @staticmethod
    def draw_lots(user_ids: [int], effective_date: str, is_random: bool = True) -> (bool, str):
        effective_date = "%s 00:00:00" % effective_date
        obj = DrawLots.objects.filter(effective_date=effective_date)
        if obj:
            return False, "The current time has been drawn"

        for user_id in user_ids:
            user_obj = Users.objects.filter(id=user_id).first()
            if not user_obj:
                return False, "user_id: %d does not exist" % user_id

        today = parse(time.strftime('%Y-%m-%d %H:%M:%S', time.localtime(time.time())))
        effective_date = parse(effective_date)
        if today > effective_date:
            return False, "The effective time is not allowed to be greater than the current time"

        if is_random is True:
            random.shuffle(user_ids)

        s = ",".join([str(i) for i in user_ids])
        DrawLots(
            draw_lots_user_ids=s,
            effective_date=effective_date
        ).save()
        return True, "Lottery completed"

    @staticmethod
    def update_oncall_table(date: str, src_user_id, dest_user_id: int) -> (bool, str):
        src_user_obj = Users.objects.filter(id=src_user_id).first()
        dest_user_obj = Users.objects.filter(id=dest_user_id).first()
        if not src_user_obj or not dest_user_obj:
            return False, "user not found"
        date = "%s 00:00:00" % date
        today = parse(time.strftime('%Y-%m-%d %H:%M:%S', time.localtime(time.time())))
        date = parse(date)
        if today >= date:
            return False, "The effective time is not allowed to be greater than the current time"

        sched_obj = OnCallSchedule.objects.filter(
            on_call_date=date
        ).first()

        if sched_obj:
            if sched_obj.user.id == src_user_id or sched_obj.src_user_id == dest_user_id:
                sched_obj.delete()
            else:
                sched_obj.user = dest_user_obj
                sched_obj.type = 1
                sched_obj.src_user_id = src_user_id
                sched_obj.save()
        else:
            s = scheduler(date.strftime('%Y-%m'))
            l1 = s.on_call_list()
            for i in l1:
                if i["date"] == date.strftime('%Y-%m-%d'):
                    if i["user_id"] == dest_user_id:
                        return True, ""
            OnCallSchedule(
                user=dest_user_obj,
                on_call_date=date,
                type=1,
                src_user_id=src_user_id
            ).save()
        return True, ""

    def get_oncall_list(self, date: str):
        sched = scheduler(date)
        return sched.on_call_list()

    @staticmethod
    def reset_future(date: str) -> (bool, str):
        date = "%s 00:00:00" % date
        today = parse(time.strftime('%Y-%m-%d %H:%M:%S', time.localtime(time.time())))
        date = parse(date)
        if today >= date:
            return False, "The effective time is not allowed to be greater than the current time"
        sched_obj = OnCallSchedule.objects.filter(
            on_call_date=date
        ).first()
        if sched_obj:
            sched_obj.delete()
        return True, ""

    @staticmethod
    def get_user_list(out_params: dict):
        in_params = {
            "phone": "phone",
            "username": "username__icontains",
            "name": "name__icontains",
            "email": "email__icontains"
        }
        params = {}
        for k, v in out_params.items():
            if in_params.get(k, None) is not None:
                params[in_params[k]] = v
        result = []
        users = Users.objects.filter(**params)
        for user in users:
            t = {
                "user_id": user.id,
                "username": user.username,
                "name": user.name,
                "email": user.email,
                "phone": user.phone,
                'create_time': user.create_time.strftime('%Y-%m-%d %H:%M:%S')
            }
            result.append(t)
        return result

    @staticmethod
    def create_user(params: dict) -> (int, str):
        required_params = [
            "phone",
            "username",
            "name",
            "email"
        ]
        for i in required_params:
            if i not in params.keys():
                return 400, "无效的参数"
        try:
            params["phone"] = int(params["phone"])
        except Exception as e:
            return 400, str(e)

        if len(str(params['phone'])) != 11:
            return 400, "手机长度不正确"

        user = Users.objects.filter(username=params["username"]).first()
        if user:
            return 400, "用户已存在"
        try:
            Users(
                username=params["username"],
                name=params["name"],
                email=params["email"],
                phone=params["phone"]
            ).save()
        except django.db.Error as e:
            return 500, str(e)
        return 200, "success"

    @staticmethod
    def delete_user(user_id: int) -> bool:
        user = Users.objects.filter(id=user_id).first()
        if user:
            user.delete()
        return True

    @staticmethod
    def get_draw_lots_list():
        data = []
        obj = DrawLots.objects.all().order_by("-effective_date")
        for i in obj:
            data.append({
                "id": i.id,
                "draw_lots_ids": i.draw_lots_user_ids,
                "draw_lots_date": i.draw_lots_date.strftime('%Y-%m-%d %H:%M:%S'),
                "effective_date": i.effective_date.strftime('%Y-%m-%d')
            })
        return data
