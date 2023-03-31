import "./oncall.css"
import {PageContainer, ModalForm, ProFormSelect, ProFormText} from '@ant-design/pro-components';
import { useModel } from '@umijs/max';
import {Card, Calendar, Badge, BadgeProps, Alert, Space, message, Spin} from 'antd';
import type { Dayjs } from 'dayjs';
import type { CalendarMode } from 'antd/es/calendar/generateCalendar';
import {fetchOnCallUserList} from '@/services/oncall/api'
import React, {useEffect, useRef, useState} from 'react';
import 'dayjs/locale/zh-cn';
import dayjs from 'dayjs';
import {useIntl} from "@@/exports";
import {updateOncall, fetchUserList} from "@/services/oncall/api";
dayjs.locale('zh-cn');

/**
 * 每个单独的卡片，为了复用样式抽成了组件
 * @param
 * @returns
 */

const OnCallList: React.FC = () => {
  const { initialState } = useModel('@@initialState');
  const [thisMonthData, setThisMonthData] = useState([]);
  const [todayOncallUser, setTodayOncallUser] = useState("")
  const [loading, setLoading] = useState(true)
  const [createModalOpen, handleModalOpen] = useState(false);
  const createFormRef = useRef();
  const [currentClickData, setCurrentClickData] = useState({});
  const [selecteValue, SetselecteValue] = useState(dayjs().format('YYYY-MM'))
  const intl = useIntl();

  const handleAdd = async (fields: API.RuleListItem) => {
    const hide = message.loading('正在修改');
    try {
      const data = await updateOncall(fields);
      if (data.code === 200) {
        hide()
        message.success('update successfully');
        return true;
      }
      hide()
      message.error(data.msg)
      return false;
    } catch (error) {
      hide();
      message.error("update fail");
      return false;
    }
  };

  const onPanelChange = async (value: Dayjs, mode: CalendarMode) => {
    setLoading(true)
    const data = await fetchOncallList(value.format('YYYY-MM'))
    SetselecteValue(value.format('YYYY-MM'))
    data.forEach(item => { if (item.date === dayjs().format('YYYY-MM-DD')) {setTodayOncallUser(item.username)}})
    setThisMonthData(data);
    setLoading(false)
  };

  const fetchOncallList = async (date: string) => {
    const params = {
      "date": date
    }
    const data = await fetchOnCallUserList(params)
    if (data.code !== 200) {
      message.error(data.msg)
      return []
    }
    return data.data
  }

  const handleUserList = async () => {
    const data = await fetchUserList();
    const result = []
    data.data.forEach(item => {
      result.push({
        "label": item.username,
        "value": item.user_id
      })
    })
    return result
  }


  useEffect( ()=>{
    (async function init() {
      const data = await fetchOncallList(dayjs().format("YYYY-MM"))
      data.forEach(item => { if (item.date === dayjs().format('YYYY-MM-DD')) {setTodayOncallUser(item.username)}})
      setThisMonthData(data);
      if (data.length === 0) {
        setLoading(false)
      }

    })()
  }, [])

  const getListData = (value: Dayjs) => {
    const data = []
    thisMonthData.forEach(item => {
      if (item.date === value.format("YYYY-MM-DD")) {
        data.push({
          "type": "success",
          "username": item.username,
          "name": item.name,
          "phone": item.phone,
          "email": item.email,
          "date": item.date,
          "user_id": item.user_id,
          "src_user_id": item.src_user_id,
        })
        if (item.src_user_id != 0) {
          data.push({
            "type": "warning",
            "username": item.src_user_username,
            "name": item.src_user_name,
            "date": `${item.date}-1`,
            "user_id": item.user_id,
            "src_user_id": item.src_user_id
          })
        }
        data.push({
          type: item.type,
          new_user_id: item.user_id,
          new_user_username: item.username,
          new_user_name: item.user_name,
          src_user_id: item.src_user_id,
          src_user_username: item.src_user_username,
          src_user_name: item.src_user_name,
          date: item.date
        })
      }
    })
    return data;
  }

  const getText = (item) => {
    if (item.type == "warning") {
      return <del>{item.username}</del>
    } else if (item.type == "success") {
      return item.username
    }
  }
  const handleStorageCurrentData = (item) => {
    setCurrentClickData(item)
    const data = {
      date: item.date
    }
    if (item.type === 1) {
      data.src_user_id = item.src_user_id
      data.user_id = item.new_user_id

    }else if(item.type === 0) {
      data.src_user_id = item.new_user_id
    }
    createFormRef.current.setFieldsValue(data)
    handleModalOpen(true)
  }
  const dateCellRender = (value: Dayjs) => {
    const listData = getListData(value);

    // 传入的日期是最后一天才设置loading为false
    if (thisMonthData.length > 0) {
      if (value.format("YYYY-MM-DD") === thisMonthData[thisMonthData.length - 1].date) {
        setLoading(false)
      }
  }
    const event_data = listData.pop()
    return (
      <ul className="events" onClick={()=>{handleStorageCurrentData(event_data)}}>
        {listData.map((item) => (
          <li key={item.date}>
            <Badge  status={item.type as BadgeProps['status']} text={getText(item)} />
          </li>
        ))}
      </ul>
    );
  };

  const disabledDate = (currentDate: Dayjs):boolean => {
    const today = dayjs();
    return currentDate.isBefore(today);
  }

  return (
    <PageContainer title={false}>
      <Card
        style={{
          borderRadius: 8,
        }}
        bodyStyle={{
          backgroundImage:
            initialState?.settings?.navTheme === 'realDark'
              ? 'background-image: linear-gradient(75deg, #1A1B1F 0%, #191C1F 100%)'
              : 'background-image: linear-gradient(75deg, #FBFDFF 0%, #F5F7FF 100%)',
        }}
      >
        <div
          style={{
            backgroundPosition: '100% -30%',
            backgroundRepeat: 'no-repeat',
            backgroundSize: '274px auto',
            backgroundImage:
              "url('https://gw.alipayobjects.com/mdn/rms_a9745b/afts/img/A*BuFmQqsB2iAAAAAAAAAAAAAAARQnAQ')",
          }}
        >
          <Spin tip="Loading..." spinning={loading}>
          <Alert message={<>
            <Space  direction="vertical">
              <span>今日时间: {dayjs().format("YYYY-MM-DD")}</span>
              <span>今日值班: {todayOncallUser}</span>
            </Space>
          </>}/>
          <Calendar
            onPanelChange={async (value)  => {await onPanelChange(value)}}
            dateCellRender={dateCellRender}
            mode="month"
            disabledDate={disabledDate}
            validRange={[dayjs().subtract(2, 'year').startOf('year'), dayjs().add(1, 'year').endOf('year')]}
          />;
          </Spin>
        </div>

        <ModalForm
          modalProps={{
            forceRender: true,
            onCancel: ()=>{
              createFormRef.current?.resetFields();
            }
          }}
          title={intl.formatMessage({
            id: 'pages.oncallList.update.newTitle',
            defaultMessage: 'New rule',
          })}
          width="400px"
          open={createModalOpen}
          formRef={createFormRef}
          onOpenChange={handleModalOpen}
          onFinish={async (value) => {
            setLoading(true)
            const data = {
              src_user_id: value.src_user_id,
              new_user_id: value.user_id,
              date: value.date
            }
            const success = await handleAdd(data);
            if (success) {
              const data = await fetchOncallList(selecteValue)
              data.forEach(item => { if (item.date === dayjs().format('YYYY-MM-DD')) {setTodayOncallUser(item.username)}})
              setThisMonthData(data);
              handleModalOpen(false);
              createFormRef.current?.resetFields();
            }
          }}
        >

          <ProFormSelect
            name="src_user_id"
            label="原值班人"
            request={async () => {return await handleUserList()}}
            placeholder="请选择值班人"
            rules={[{ required: true, message: '请选择值班人' }]}
            disabled
          />

          <ProFormSelect
            name="user_id"
            label="新值班人"
            request={async () => {return await handleUserList()}}
            placeholder="请选择值班人"
            rules={[{ required: true, message: '请选择值班人' }]}
          />

          <ProFormText
            name="date"
            label="值班时间"
            placeholder="请选择值班人"
            rules={[{ required: true, message: '请选择值班人' }]}
            disabled
          />

        </ModalForm>
      </Card>
    </PageContainer>
  );
};

export default OnCallList;
