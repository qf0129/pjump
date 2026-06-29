import { useEffect, useState, useCallback } from 'react';
import { Button, Flex, Form, Input, Modal, Popconfirm, Space, Switch, Table, type TableColumnsType } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { Apis, type ReqQueryUser, type ReqCreateUser, type ReqUpdateUser } from '@/apis/apis';
import type { User } from '@/utils/type';
import useApp from 'antd/es/app/useApp';

export default function UserPage() {
  const app = useApp();
  const [loading, setLoading] = useState(false);
  const [list, setList] = useState<User[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [form] = Form.useForm();

  const fetchList = useCallback(
    (p?: number, ps?: number, kw?: string) => {
      setLoading(true);
      const keyword = kw !== undefined ? kw : search;
      const params: ReqQueryUser = {
        Page: p ?? page,
        PageSize: ps ?? pageSize,
      };
      if (keyword) {
        params.Search = keyword;
      }
      Apis.QueryUser(params)
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
    [page, pageSize, search, app.message]
  );

  useEffect(() => {
    fetchList();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSearch = (value: string) => {
    setSearch(value);
    setPage(1);
    fetchList(1, pageSize, value);
  };

  const handlePageChange = (p: number, ps: number) => {
    setPage(p);
    setPageSize(ps);
    fetchList(p, ps);
  };

  const openCreateModal = () => {
    setEditingUser(null);
    form.resetFields();
    setModalOpen(true);
  };

  const openEditModal = (user: User) => {
    setEditingUser(user);
    form.setFieldsValue({
      Username: user.Username,
      Nickname: user.Nickname,
      Email: user.Email,
      Phone: user.Phone,
      IsAdmin: user.IsAdmin,
    });
    setModalOpen(true);
  };

  const handleModalOk = () => {
    form.validateFields().then((values) => {
      if (editingUser) {
        const data: ReqUpdateUser = { Uid: editingUser.Uid!, ...values };
        Apis.UpdateUser(data).then((res) => {
          if (res.Code === 0) {
            app.message.success('更新成功');
            setModalOpen(false);
            fetchList();
          } else {
            app.message.warning(res.Msg);
          }
        });
      } else {
        const data: ReqCreateUser = values;
        Apis.CreateUser(data).then((res) => {
          if (res.Code === 0) {
            app.message.success('创建成功');
            setModalOpen(false);
            fetchList();
          } else {
            app.message.warning(res.Msg);
          }
        });
      }
    });
  };

  const handleDelete = (uid: string) => {
    Apis.DeleteUser({ Uid: uid }).then((res) => {
      if (res.Code === 0) {
        app.message.success('删除成功');
        fetchList();
      } else {
        app.message.warning(res.Msg);
      }
    });
  };

  const columns: TableColumnsType<User> = [
    { title: '用户名', dataIndex: 'Username', key: 'Username' },
    { title: '昵称', dataIndex: 'Nickname', key: 'Nickname' },
    { title: '邮箱', dataIndex: 'Email', key: 'Email' },
    { title: '手机号', dataIndex: 'Phone', key: 'Phone' },
    {
      title: '管理员',
      dataIndex: 'IsAdmin',
      key: 'IsAdmin',
      width: 80,
      render: (v: boolean) => (v ? '✔' : ''),
    },
    {
      title: '操作',
      key: 'actions',
      width: 160,
      render: (_, record) => (
        <Space>
          <Button type="link" size="small" icon={<EditOutlined />} onClick={() => openEditModal(record)}>
            编辑
          </Button>
          <Popconfirm title="确定删除该用户？" onConfirm={() => handleDelete(record.Uid!)}>
            <Button type="link" size="small" danger icon={<DeleteOutlined />} disabled={record.Username === 'admin'}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: 24, height: '100%', overflow: 'auto' }}>
      <Flex align="center" justify="space-between" gap={12} style={{ marginBottom: 24 }}>
        <Button type="primary" icon={<PlusOutlined />} onClick={openCreateModal}>
          创建用户
        </Button>
        <Input.Search
          placeholder="搜索用户名、昵称、邮箱、手机号..."
          allowClear
          value={search}
          onSearch={handleSearch}
          onChange={(e) => setSearch(e.target.value)}
          style={{ maxWidth: 360 }}
        />
      </Flex>

      <Table
        rowKey="Uid"
        columns={columns}
        dataSource={list}
        loading={loading}
        pagination={{
          current: page,
          pageSize,
          total,
          showSizeChanger: true,
          showTotal: (t) => `共 ${t} 条`,
          onChange: handlePageChange,
        }}
      />

      <Modal
        title={editingUser ? '编辑用户' : '创建用户'}
        open={modalOpen}
        onOk={handleModalOk}
        onCancel={() => setModalOpen(false)}
        destroyOnHidden
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item name="Username" label="用户名" rules={[{ required: true, message: '请输入用户名' }]}>
            <Input disabled={!!editingUser} />
          </Form.Item>
          <Form.Item name="Nickname" label="昵称">
            <Input />
          </Form.Item>
          <Form.Item name="Email" label="邮箱">
            <Input />
          </Form.Item>
          <Form.Item name="Phone" label="手机号">
            <Input />
          </Form.Item>
          <Form.Item
            name="Password"
            label="密码"
            rules={editingUser ? undefined : [{ required: true, message: '请输入密码' }]}
          >
            <Input.Password placeholder={editingUser ? '留空则不修改' : ''} />
          </Form.Item>
          <Form.Item name="IsAdmin" label="管理员" valuePropName="checked">
            <Switch />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
