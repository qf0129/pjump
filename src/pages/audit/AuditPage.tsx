import { useEffect, useState, useCallback } from 'react';
import { Button, Form, Input, Select, Space, Table, Tabs, Tag, Typography, type TableColumnsType } from 'antd';
import { SearchOutlined, ReloadOutlined } from '@ant-design/icons';
import { Apis } from '@/apis/apis';
import type { LoginRecord, OperationRecord, SessionRecord } from '@/utils/type';
import useApp from 'antd/es/app/useApp';

const PAGE_SIZE = 10;

type TabKey = 'operation' | 'login' | 'session';

function formatTime(value?: string) {
  if (!value) return '-';
  return value.replace('T', ' ').replace(/\+.*/, '').replace(/Z$/, '');
}

function actionTag(action: string) {
  const colorMap: Record<string, string> = {
    create: 'green',
    update: 'blue',
    delete: 'red',
  };
  const labelMap: Record<string, string> = {
    create: '新增',
    update: '修改',
    delete: '删除',
  };
  return <Tag color={colorMap[action] || 'default'}>{labelMap[action] || action}</Tag>;
}

export default function AuditPage() {
  const app = useApp();
  const [activeKey, setActiveKey] = useState<TabKey>('session');
  const [operationForm] = Form.useForm();
  const [loginForm] = Form.useForm();
  const [sessionForm] = Form.useForm();

  const [operationLoading, setOperationLoading] = useState(false);
  const [operationList, setOperationList] = useState<OperationRecord[]>([]);
  const [operationTotal, setOperationTotal] = useState(0);
  const [operationPage, setOperationPage] = useState(1);
  const [operationPageSize, setOperationPageSize] = useState(PAGE_SIZE);

  const [loginLoading, setLoginLoading] = useState(false);
  const [loginList, setLoginList] = useState<LoginRecord[]>([]);
  const [loginTotal, setLoginTotal] = useState(0);
  const [loginPage, setLoginPage] = useState(1);
  const [loginPageSize, setLoginPageSize] = useState(PAGE_SIZE);

  const [sessionLoading, setSessionLoading] = useState(false);
  const [sessionList, setSessionList] = useState<SessionRecord[]>([]);
  const [sessionTotal, setSessionTotal] = useState(0);
  const [sessionPage, setSessionPage] = useState(1);
  const [sessionPageSize, setSessionPageSize] = useState(PAGE_SIZE);

  const fetchOperations = useCallback(
    (page = operationPage, pageSize = operationPageSize) => {
      setOperationLoading(true);
      Apis.QueryOperationRecord({
        Page: page,
        PageSize: pageSize,
        ...operationForm.getFieldsValue(),
      })
        .then((res) => {
          if (res.Code === 0) {
            setOperationList(res.Data.List ?? []);
            setOperationTotal(res.Data.Total ?? 0);
          } else {
            app.message.warning(res.Msg);
          }
        })
        .finally(() => setOperationLoading(false));
    },
    [app.message, operationForm, operationPage, operationPageSize]
  );

  const fetchLogins = useCallback(
    (page = loginPage, pageSize = loginPageSize) => {
      setLoginLoading(true);
      Apis.QueryLoginRecord({
        Page: page,
        PageSize: pageSize,
        ...loginForm.getFieldsValue(),
      })
        .then((res) => {
          if (res.Code === 0) {
            setLoginList(res.Data.List ?? []);
            setLoginTotal(res.Data.Total ?? 0);
          } else {
            app.message.warning(res.Msg);
          }
        })
        .finally(() => setLoginLoading(false));
    },
    [app.message, loginForm, loginPage, loginPageSize]
  );

  const fetchSessions = useCallback(
    (page = sessionPage, pageSize = sessionPageSize) => {
      setSessionLoading(true);
      Apis.QuerySessionRecord({
        Page: page,
        PageSize: pageSize,
        ...sessionForm.getFieldsValue(),
      })
        .then((res) => {
          if (res.Code === 0) {
            setSessionList(res.Data.List ?? []);
            setSessionTotal(res.Data.Total ?? 0);
          } else {
            app.message.warning(res.Msg);
          }
        })
        .finally(() => setSessionLoading(false));
    },
    [app.message, sessionForm, sessionPage, sessionPageSize]
  );

  useEffect(() => {
    fetchOperations(1, PAGE_SIZE);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleTabChange = (key: string) => {
    const nextKey = key as TabKey;
    setActiveKey(nextKey);
    if (nextKey === 'operation' && operationList.length === 0) fetchOperations(1, PAGE_SIZE);
    if (nextKey === 'login' && loginList.length === 0) fetchLogins(1, PAGE_SIZE);
    if (nextKey === 'session' && sessionList.length === 0) fetchSessions(1, PAGE_SIZE);
  };

  const operationColumns: TableColumnsType<OperationRecord> = [
    { title: '时间', dataIndex: 'OperateTime', width: 170, render: formatTime },
    { title: '用户', dataIndex: 'Username', width: 120 },
    { title: '操作', dataIndex: 'Action', width: 90, render: actionTag },
    { title: '资源', dataIndex: 'Resource', width: 120 },
    { title: '资源名称', dataIndex: 'ResourceName', width: 160 },
    { title: '目标 UID', dataIndex: 'TargetUid', width: 180, ellipsis: true },
    { title: 'IP', dataIndex: 'Ip', width: 140 },
    {
      title: '详情',
      dataIndex: 'Detail',
      ellipsis: true,
      render: (v: string) => (
        <Typography.Text copyable={!!v} style={{ maxWidth: 360 }} ellipsis>
          {v || '-'}
        </Typography.Text>
      ),
    },
  ];

  const loginColumns: TableColumnsType<LoginRecord> = [
    { title: '时间', dataIndex: 'LoginTime', width: 170, render: formatTime },
    { title: '用户', dataIndex: 'Username', width: 140 },
    {
      title: '结果',
      dataIndex: 'Success',
      width: 90,
      render: (v: boolean) => <Tag color={v ? 'green' : 'red'}>{v ? '成功' : '失败'}</Tag>,
    },
    { title: '消息', dataIndex: 'Message', width: 160 },
    { title: 'IP', dataIndex: 'Ip', width: 140 },
    { title: 'User-Agent', dataIndex: 'UserAgent', ellipsis: true },
  ];

  const sessionColumns: TableColumnsType<SessionRecord> = [
    {
      title: '开始时间',
      dataIndex: 'StartTime',
      width: 170,
      render: formatTime,
    },
    { title: '结束时间', dataIndex: 'EndTime', width: 170, render: formatTime },
    { title: '用户 UID', dataIndex: 'UserUid', width: 180, ellipsis: true },
    { title: '主机 UID', dataIndex: 'HostUid', width: 180, ellipsis: true },
    {
      title: '系统用户 UID',
      dataIndex: 'OsUserUid',
      width: 180,
      ellipsis: true,
    },
    {
      title: '协议',
      dataIndex: 'Proctol',
      width: 90,
      render: (v: string) => <Tag>{v?.toUpperCase()}</Tag>,
    },
    {
      title: '状态',
      dataIndex: 'Online',
      width: 90,
      render: (v: boolean) => <Tag color={v ? 'green' : 'default'}>{v ? '在线' : '离线'}</Tag>,
    },
  ];

  const operationToolbar = (
    <Form form={operationForm} layout="inline" style={{ marginBottom: 16 }}>
      <Form.Item name="Username">
        <Input placeholder="用户名" allowClear style={{ width: 160 }} />
      </Form.Item>
      <Form.Item name="Action">
        <Select
          placeholder="操作类型"
          allowClear
          style={{ width: 140 }}
          options={[
            { value: 'create', label: '新增' },
            { value: 'update', label: '修改' },
            { value: 'delete', label: '删除' },
          ]}
        />
      </Form.Item>
      <Form.Item name="Resource">
        <Input placeholder="资源类型" allowClear style={{ width: 160 }} />
      </Form.Item>
      <Form.Item>
        <Space>
          <Button
            type="primary"
            icon={<SearchOutlined />}
            onClick={() => {
              setOperationPage(1);
              fetchOperations(1, operationPageSize);
            }}
          >
            查询
          </Button>
          <Button
            icon={<ReloadOutlined />}
            onClick={() => {
              operationForm.resetFields();
              setOperationPage(1);
              fetchOperations(1, operationPageSize);
            }}
          />
        </Space>
      </Form.Item>
    </Form>
  );

  const loginToolbar = (
    <Form form={loginForm} layout="inline" style={{ marginBottom: 16 }}>
      <Form.Item name="Username">
        <Input placeholder="用户名" allowClear style={{ width: 180 }} />
      </Form.Item>
      <Form.Item name="Success">
        <Select
          placeholder="登录结果"
          allowClear
          style={{ width: 140 }}
          options={[
            { value: true, label: '成功' },
            { value: false, label: '失败' },
          ]}
        />
      </Form.Item>
      <Form.Item>
        <Space>
          <Button
            type="primary"
            icon={<SearchOutlined />}
            onClick={() => {
              setLoginPage(1);
              fetchLogins(1, loginPageSize);
            }}
          >
            查询
          </Button>
          <Button
            icon={<ReloadOutlined />}
            onClick={() => {
              loginForm.resetFields();
              setLoginPage(1);
              fetchLogins(1, loginPageSize);
            }}
          />
        </Space>
      </Form.Item>
    </Form>
  );

  const sessionToolbar = (
    <Form form={sessionForm} layout="inline" style={{ marginBottom: 16 }}>
      <Form.Item name="Protocol">
        <Select
          placeholder="协议"
          allowClear
          style={{ width: 120 }}
          options={[
            { value: 'ssh', label: 'SSH' },
            { value: 'rdp', label: 'RDP' },
            { value: 'vnc', label: 'VNC' },
          ]}
        />
      </Form.Item>
      <Form.Item name="Online">
        <Select
          placeholder="状态"
          allowClear
          style={{ width: 120 }}
          options={[
            { value: true, label: '在线' },
            { value: false, label: '离线' },
          ]}
        />
      </Form.Item>
      <Form.Item name="HostUid">
        <Input placeholder="主机 UID" allowClear style={{ width: 180 }} />
      </Form.Item>
      <Form.Item>
        <Space>
          <Button
            type="primary"
            icon={<SearchOutlined />}
            onClick={() => {
              setSessionPage(1);
              fetchSessions(1, sessionPageSize);
            }}
          >
            查询
          </Button>
          <Button
            icon={<ReloadOutlined />}
            onClick={() => {
              sessionForm.resetFields();
              setSessionPage(1);
              fetchSessions(1, sessionPageSize);
            }}
          />
        </Space>
      </Form.Item>
    </Form>
  );

  return (
    <div style={{ padding: 24, height: '100%', overflow: 'auto' }}>
      <Tabs
        type="card"
        tabPlacement="start"
        activeKey={activeKey}
        onChange={handleTabChange}
        items={[
          {
            key: 'session',
            label: '会话记录',
            children: (
              <>
                {sessionToolbar}
                <Table
                  rowKey="Uid"
                  columns={sessionColumns}
                  dataSource={sessionList}
                  loading={sessionLoading}
                  scroll={{ x: 1100 }}
                  pagination={{
                    current: sessionPage,
                    pageSize: sessionPageSize,
                    total: sessionTotal,
                    showSizeChanger: true,
                    showTotal: (t) => `共 ${t} 条`,
                    onChange: (p, ps) => {
                      setSessionPage(p);
                      setSessionPageSize(ps);
                      fetchSessions(p, ps);
                    },
                  }}
                />
              </>
            ),
          },
          {
            key: 'operation',
            label: '操作记录',
            children: (
              <>
                {operationToolbar}
                <Table
                  rowKey="Uid"
                  columns={operationColumns}
                  dataSource={operationList}
                  loading={operationLoading}
                  scroll={{ x: 1300 }}
                  pagination={{
                    current: operationPage,
                    pageSize: operationPageSize,
                    total: operationTotal,
                    showSizeChanger: true,
                    showTotal: (t) => `共 ${t} 条`,
                    onChange: (p, ps) => {
                      setOperationPage(p);
                      setOperationPageSize(ps);
                      fetchOperations(p, ps);
                    },
                  }}
                />
              </>
            ),
          },
          {
            key: 'login',
            label: '登录记录',
            children: (
              <>
                {loginToolbar}
                <Table
                  rowKey="Uid"
                  columns={loginColumns}
                  dataSource={loginList}
                  loading={loginLoading}
                  scroll={{ x: 1000 }}
                  pagination={{
                    current: loginPage,
                    pageSize: loginPageSize,
                    total: loginTotal,
                    showSizeChanger: true,
                    showTotal: (t) => `共 ${t} 条`,
                    onChange: (p, ps) => {
                      setLoginPage(p);
                      setLoginPageSize(ps);
                      fetchLogins(p, ps);
                    },
                  }}
                />
              </>
            ),
          },
        ]}
      />
    </div>
  );
}
