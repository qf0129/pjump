import { useEffect, useState, useCallback } from 'react';
import { Button, Form, Input, Select, Space, Table, Tag, Typography, type TableColumnsType } from 'antd';
import { SearchOutlined, ReloadOutlined } from '@ant-design/icons';
import { Apis } from '@/apis/apis';
import type { LoginRecord, OperationRecord, SessionRecord } from '@/utils/type';
import useApp from 'antd/es/app/useApp';

const PAGE_SIZE = 10;

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

export function SessionAuditPage() {
  const app = useApp();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [list, setList] = useState<SessionRecord[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(PAGE_SIZE);

  const fetchData = useCallback(
    (p = page, ps = pageSize) => {
      setLoading(true);
      Apis.QuerySessionRecord({
        Page: p,
        PageSize: ps,
        ...form.getFieldsValue(),
      })
        .then((res) => {
          if (res.Code === 0) {
            setList(res.Data.List ?? []);
            setTotal(res.Data.Total ?? 0);
          } else {
            app.message.warning(res.Msg);
          }
        })
        .finally(() => setLoading(false));
    },
    [app.message, form, page, pageSize]
  );

  useEffect(() => {
    fetchData(1, PAGE_SIZE);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const columns: TableColumnsType<SessionRecord> = [
    { title: '开始时间', dataIndex: 'StartTime', width: 170, render: formatTime },
    { title: '结束时间', dataIndex: 'EndTime', width: 170, render: formatTime },
    { title: '用户 UID', dataIndex: 'UserUid', width: 180, ellipsis: true },
    { title: '主机 UID', dataIndex: 'HostUid', width: 180, ellipsis: true },
    { title: '系统用户 UID', dataIndex: 'OsUserUid', width: 180, ellipsis: true },
    { title: '协议', dataIndex: 'Proctol', width: 90, render: (v: string) => <Tag>{v?.toUpperCase()}</Tag> },
    { title: '状态', dataIndex: 'Online', width: 90, render: (v: boolean) => <Tag color={v ? 'green' : 'default'}>{v ? '在线' : '离线'}</Tag> },
  ];

  return (
    <AuditPageShell>
      <Form form={form} layout="inline" style={{ marginBottom: 16 }}>
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
                setPage(1);
                fetchData(1, pageSize);
              }}
            >
              查询
            </Button>
            <Button
              icon={<ReloadOutlined />}
              onClick={() => {
                form.resetFields();
                setPage(1);
                fetchData(1, pageSize);
              }}
            />
          </Space>
        </Form.Item>
      </Form>
      <Table
        rowKey="Uid"
        columns={columns}
        dataSource={list}
        loading={loading}
        scroll={{ x: 1100 }}
        pagination={{
          current: page,
          pageSize,
          total,
          showSizeChanger: true,
          showTotal: (t) => `共 ${t} 条`,
          onChange: (p, ps) => {
            setPage(p);
            setPageSize(ps);
            fetchData(p, ps);
          },
        }}
      />
    </AuditPageShell>
  );
}

export function OperationAuditPage() {
  const app = useApp();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [list, setList] = useState<OperationRecord[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(PAGE_SIZE);

  const fetchData = useCallback(
    (p = page, ps = pageSize) => {
      setLoading(true);
      Apis.QueryOperationRecord({
        Page: p,
        PageSize: ps,
        ...form.getFieldsValue(),
      })
        .then((res) => {
          if (res.Code === 0) {
            setList(res.Data.List ?? []);
            setTotal(res.Data.Total ?? 0);
          } else {
            app.message.warning(res.Msg);
          }
        })
        .finally(() => setLoading(false));
    },
    [app.message, form, page, pageSize]
  );

  useEffect(() => {
    fetchData(1, PAGE_SIZE);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const columns: TableColumnsType<OperationRecord> = [
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

  return (
    <AuditPageShell>
      <Form form={form} layout="inline" style={{ marginBottom: 16 }}>
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
                setPage(1);
                fetchData(1, pageSize);
              }}
            >
              查询
            </Button>
            <Button
              icon={<ReloadOutlined />}
              onClick={() => {
                form.resetFields();
                setPage(1);
                fetchData(1, pageSize);
              }}
            />
          </Space>
        </Form.Item>
      </Form>
      <Table
        rowKey="Uid"
        columns={columns}
        dataSource={list}
        loading={loading}
        scroll={{ x: 1300 }}
        pagination={{
          current: page,
          pageSize,
          total,
          showSizeChanger: true,
          showTotal: (t) => `共 ${t} 条`,
          onChange: (p, ps) => {
            setPage(p);
            setPageSize(ps);
            fetchData(p, ps);
          },
        }}
      />
    </AuditPageShell>
  );
}

export function LoginAuditPage() {
  const app = useApp();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [list, setList] = useState<LoginRecord[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(PAGE_SIZE);

  const fetchData = useCallback(
    (p = page, ps = pageSize) => {
      setLoading(true);
      Apis.QueryLoginRecord({
        Page: p,
        PageSize: ps,
        ...form.getFieldsValue(),
      })
        .then((res) => {
          if (res.Code === 0) {
            setList(res.Data.List ?? []);
            setTotal(res.Data.Total ?? 0);
          } else {
            app.message.warning(res.Msg);
          }
        })
        .finally(() => setLoading(false));
    },
    [app.message, form, page, pageSize]
  );

  useEffect(() => {
    fetchData(1, PAGE_SIZE);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const columns: TableColumnsType<LoginRecord> = [
    { title: '时间', dataIndex: 'LoginTime', width: 170, render: formatTime },
    { title: '用户', dataIndex: 'Username', width: 140 },
    { title: '结果', dataIndex: 'Success', width: 90, render: (v: boolean) => <Tag color={v ? 'green' : 'red'}>{v ? '成功' : '失败'}</Tag> },
    { title: '消息', dataIndex: 'Message', width: 160 },
    { title: 'IP', dataIndex: 'Ip', width: 140 },
    { title: 'User-Agent', dataIndex: 'UserAgent', ellipsis: true },
  ];

  return (
    <AuditPageShell>
      <Form form={form} layout="inline" style={{ marginBottom: 16 }}>
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
                setPage(1);
                fetchData(1, pageSize);
              }}
            >
              查询
            </Button>
            <Button
              icon={<ReloadOutlined />}
              onClick={() => {
                form.resetFields();
                setPage(1);
                fetchData(1, pageSize);
              }}
            />
          </Space>
        </Form.Item>
      </Form>
      <Table
        rowKey="Uid"
        columns={columns}
        dataSource={list}
        loading={loading}
        scroll={{ x: 1000 }}
        pagination={{
          current: page,
          pageSize,
          total,
          showSizeChanger: true,
          showTotal: (t) => `共 ${t} 条`,
          onChange: (p, ps) => {
            setPage(p);
            setPageSize(ps);
            fetchData(p, ps);
          },
        }}
      />
    </AuditPageShell>
  );
}

function AuditPageShell({ children }: { children: React.ReactNode }) {
  return <div style={{ padding: 24, height: '100%', overflow: 'auto' }}>{children}</div>;
}

export default SessionAuditPage;
