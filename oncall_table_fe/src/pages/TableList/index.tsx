import { addRule, removeRule, rule, updateRule } from '@/services/ant-design-pro/api';
import { PlusOutlined } from '@ant-design/icons';
import type { ActionType, ProColumns, ProDescriptionsItemProps } from '@ant-design/pro-components';
import {
  FooterToolbar,
  ModalForm,
  PageContainer,
  ProDescriptions,
  ProFormText,
  ProTable,
} from '@ant-design/pro-components';
import { FormattedMessage, useIntl } from '@umijs/max';
import { Button, Drawer, Popconfirm, message } from 'antd';
import React, { useRef, useState } from 'react';
import type { FormValueType } from './components/UpdateForm';
import UpdateForm from './components/UpdateForm';

/**
 * @en-US Add node
 * @zh-CN 添加节点
 * @param fields
 */
const handleAdd = async (fields: API.RuleListItem) => {
  const hide = message.loading('正在添加');
  try {
    const data = await addRule(fields);
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
const handleUpdate = async (fields: FormValueType) => {
  const hide = message.loading('Configuring');
  try {
    await updateRule({
      name: fields.name,
      desc: fields.desc,
      key: fields.key,
    });
    hide();

    message.success('Configuration is successful');
    return true;
  } catch (error) {
    hide();
    message.error('Configuration failed, please try again!');
    return false;
  }
};

/**
 *  Delete node
 * @zh-CN 删除节点
 *
 * @param selectedRows
 */
const handleRemove = async (selectedRows: API.RuleListItem[]) => {
  const hide = message.loading('正在删除');
  if (!selectedRows) return true;
  try {
    await removeRule({
      key: selectedRows.map((row) => row.key),
    });
    hide();
    message.success('Deleted successfully and will refresh soon');
    return true;
  } catch (error) {
    hide();
    message.error('Delete failed, please try again');
    return false;
  }
};

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
      user_id: item.user_id
    }
    await removeRule(data);
    message.success("删除成功")
    actionRef.current?.reload()
  }

  const columns: ProColumns<API.RuleListItem>[] = [
    {
      title: (
        <FormattedMessage
          id="pages.searchTable.updateForm.ruleName.userID"
          defaultMessage="用户ID"
        />
      ),
      dataIndex: 'user_id',
    },
    {
      title: (
        <FormattedMessage
          id="pages.searchTable.updateForm.ruleName.nameLabel"
          defaultMessage="Rule name"
        />
      ),
      dataIndex: 'username',
      tip: '用户名称',
    },
    {
      title: <FormattedMessage id="pages.searchTable.name" defaultMessage="name" />,
      dataIndex: 'name',
    },
    {
      title: <FormattedMessage id="pages.searchTable.phone" defaultMessage="phone" />,
      dataIndex: 'phone',
    },
    {
      title: <FormattedMessage id="pages.searchTable.titleDesc" defaultMessage="email" />,
      dataIndex: 'email',
    },
    {
      title: (
        <FormattedMessage
          id="pages.searchTable.titleUpdatedAt"
          defaultMessage="Last scheduled time"
        />
      ),
      sorter: true,
      dataIndex: 'create_time',
      valueType: 'dateTime',
      hideInSearch: true,
      renderFormItem: (item, { defaultRender, ...rest }, form) => {
        return defaultRender(item);
      },
    },
    {
      title: <FormattedMessage id="pages.searchTable.titleOption" defaultMessage="Operating" />,
      dataIndex: 'option',
      valueType: 'option',
      render: (_, item) => [
        <Popconfirm title="确定要删除这条数据吗?" onConfirm={() => handleDelete(item)} key={"confrim"}>
          <a key="link" >删除</a>
        </Popconfirm>
      ],
    },
  ];

  return (
    <PageContainer>
      <ProTable<API.RuleListItem, API.PageParams>
        headerTitle={intl.formatMessage({
          id: 'pages.searchTable.title',
          defaultMessage: 'Enquiry form',
        })}
        actionRef={actionRef}
        rowKey="user_id"
        pagination={false}
        search={{
          labelWidth: 120,
        }}
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
        request={rule}
        columns={columns}
        rowSelection={{
          onChange: (_, selectedRows) => {
            setSelectedRows(selectedRows);
          },
        }}
      />
      <ModalForm
        title={intl.formatMessage({
          id: 'pages.searchTable.createForm.newRule',
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
        <ProFormText
          rules={[
            {
              required: true,
              message: (
                <FormattedMessage
                  id="pages.searchTable.createUserRuleRequired"
                  defaultMessage="user is required"
                />
              ),
            },
          ]}
          width="md"
          name="username"
          placeholder="请输入用户名称"
        />
        <ProFormText
          rules={[
            {
              required: true,
              message: (
                <FormattedMessage
                  id="pages.searchTable.createUsernameRequired"
                  defaultMessage="user is required"
                />
              ),
            },
          ]}
          width="md"
          name="name"
          placeholder="请输入姓名"
        /> <ProFormText
        rules={[
          {
            required: true,
            message: (
              <FormattedMessage
                id="pages.searchTable.createEmailRequired"
                defaultMessage="user is required"
              />
            ),
          },
        ]}
        width="md"
        name="email"
        placeholder="请输入电子邮箱"
      /> <ProFormText
        rules={[
          {
            required: true,
            message: (
              <FormattedMessage
                id="pages.searchTable.createPhoneRequired"
                defaultMessage="user is required"
              />
            ),
          },
        ]}
        width="md"
        name="phone"
        placeholder="请输入手机号"
      />
      </ModalForm>
      <UpdateForm
        onSubmit={async (value) => {
          const success = await handleUpdate(value);
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
