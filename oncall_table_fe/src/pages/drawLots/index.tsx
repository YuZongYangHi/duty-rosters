import {fetchDrawLotsList, addDrawLotsList, delDrawLotsList, fetchUserList} from '@/services/oncall/api';
import { PlusOutlined } from '@ant-design/icons';
import type { ActionType, ProColumns }from '@ant-design/pro-components';
import {
  ModalForm,
  PageContainer, ProFormSelect,
  ProFormSwitch,
  ProTable,
  ProFormDatePicker
} from '@ant-design/pro-components';
import { FormattedMessage, useIntl } from '@umijs/max';
import { Button, Popconfirm, message } from 'antd';
import React, { useRef, useState } from 'react';
import UpdateForm from '@/pages/TableList/components/UpdateForm';
import dayjs from "dayjs";
dayjs.locale('zh-cn');

/**
 * @en-US Add node
 * @zh-CN 添加节点
 * @param fields
 */
const handleAdd = async (fields: API.RuleListItem) => {
  const hide = message.loading('正在添加');
  try {
    const data = await addDrawLotsList(fields);
    if (data.code === 200) {
      hide()
      message.success('Added successfully');
      return true;
    }
    hide()
    message.error(data.msg)
    return false;
  } catch (error) {
    hide();
    message.error('Adding failed, please try again!');
    return false;
  }
};

/**
 * @en-US Update node
 * @zh-CN 更新节点
 *
 * @param fields
 */

/**
 *  Delete node
 * @zh-CN 删除节点
 *
 * @param selectedRows
 */
const TableList: React.FC = () => {
  /**
   * @en-US Pop-up window of new window
   * @zh-CN 新建窗口的弹窗
   *  */
  const [createModalOpen, handleModalOpen] = useState<boolean>(false);
  /**
   * @en-US The pop-up window of the distribution update window
   * @zh-CN 分布更新窗口的弹窗
   * */
  const [updateModalOpen, handleUpdateModalOpen] = useState<boolean>(false);

  const [showDetail, setShowDetail] = useState<boolean>(false);

  const actionRef = useRef<ActionType>();
  const createFormRef = useRef()
  const [currentRow, setCurrentRow] = useState<API.RuleListItem>();
  const [selectedRowsState, setSelectedRows] = useState<API.RuleListItem[]>([]);

  /**
   * @en-US International configuration
   * @zh-CN 国际化配置
   * */
  const intl = useIntl();

  const handleDelete = async (item:any) => {
    const data = {
      id: item.id
    }
    await delDrawLotsList(data);
    message.success("删除成功")
    actionRef.current?.reload()
  }

  const columns: ProColumns<API.RuleListItem>[] = [
    {
      title: (
        <FormattedMessage
          defaultMessage="抽签列表"
          id="pages.drawLots.columns.list"
        />
      ),
      dataIndex: 'draw_lots_ids',
      hideInSearch: true
    },
    {
      title: <FormattedMessage defaultMessage="生效时间" id="pages.drawLots.columns.effective" />,
      dataIndex: 'effective_date',
      hideInSearch: true
    },
    {
      title: <FormattedMessage defaultMessage="抽签时间" id="pages.drawLots.columns.create" />,
      dataIndex: 'draw_lots_date',
      hideInSearch: true
    },
    {
      title: <FormattedMessage id="pages.searchTable.titleOption" defaultMessage="Operating" />,
      dataIndex: 'option',
      valueType: 'option',
      render: (_, item) => [
        <Popconfirm title="确定要删除这条数据吗?" onConfirm={() => handleDelete(item)} key={"confrim"}>
          <a key="link" disabled={!dayjs().isBefore(dayjs(item.effective_date))}>删除</a>
        </Popconfirm>
      ],
    },
  ];

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

  const disabledDate = (current) => {
    // Can not select days before today and today
    return current && current < dayjs().endOf('day');
  };

  return (
    <PageContainer>
      <ProTable<API.RuleListItem, API.PageParams>
        headerTitle={intl.formatMessage({
          id: 'pages.searchTable.title',
          defaultMessage: 'Enquiry form',
        })}
        actionRef={actionRef}
        rowKey="id"
        pagination={false}
        search={false}
        toolBarRender={() => [
          <Button
            type="primary"
            key="primary"
            onClick={() => {
              handleModalOpen(true);
            }}
          >
            <PlusOutlined /> <FormattedMessage id="pages.searchTable.new" defaultMessage="New" />
          </Button>,
        ]}
        request={fetchDrawLotsList}
        columns={columns}
        rowSelection={{
          onChange: (_, selectedRows) => {
            setSelectedRows(selectedRows);
          },
        }}
      />
      <ModalForm
        title={intl.formatMessage({
          id: 'pages.searchTable.createForm.draw',
          defaultMessage: 'New rule',
        })}
        width="400px"
        open={createModalOpen}
        formRef={createFormRef}
        onOpenChange={handleModalOpen}
        onFinish={async (value) => {
          const success = await handleAdd(value as API.RuleListItem);
          if (success) {
            handleModalOpen(false);
            createFormRef.current?.resetFields();
            if (actionRef.current) {
              actionRef.current.reload();
            }
          }
        }}
      >
        <ProFormSelect
          name="user_ids"
          label="抽签列表"
          request={async () => {return await handleUserList()}}
          placeholder="请选择值班人"
          mode={"multiple"}
          allowClear={false}
          rules={[{ required: true, message: '请选择值班人' }]}
        />
        <ProFormDatePicker
          name="date"
          fieldProps={{
            disabledDate: disabledDate
          }}
          label="生效日期"
          rules={[
            {
              required: true,
              message: "请选择生效时间"
            }]}
        />

        <ProFormSwitch name="is_random" initialValue={false} label="随机打乱" />
      </ModalForm>
      <UpdateForm
        onSubmit={async (value) => {
          const success = await addDrawLotsList(value);
          if (success) {
            handleUpdateModalOpen(false);
            setCurrentRow(undefined);
            if (actionRef.current) {
              actionRef.current.reload();
            }
          }
        }}
        onCancel={() => {
          handleUpdateModalOpen(false);
          if (!showDetail) {
            setCurrentRow(undefined);
          }
        }}
        updateModalOpen={updateModalOpen}
        values={currentRow || {}}
      />

    </PageContainer>
  );
};

export default TableList;
