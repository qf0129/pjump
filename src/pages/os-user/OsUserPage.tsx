import { useCallback, useEffect, useState } from 'react';
import { Button, Flex, Input, Popconfirm, Space, Table, Typography, type TableColumnsType } from 'antd';
import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import { Apis, type ReqQueryOsUser } from '@/apis/apis';
import type { OsUser } from '@/utils/type';
import useApp from 'antd/es/app/useApp';
import OsUserFormModal from './OsUserFormModal';
import CredentialStatus from './CredentialStatus';

const PAGE_SIZE = 10;

export default function OsUserPage() {
  const app = useApp();
  const [loading, setLoading] = useState(false);
  const [list, setList] = useState<OsUser[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(PAGE_SIZE);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingOsUser, setEditingOsUser] = useState<OsUser | null>(null);

  const fetchList = useCallback(
    (p?: number, ps?: number, kw?: string) => {
      setLoading(true);
      const keyword = kw !== undefined ? kw : search;
      const params: ReqQueryOsUser = {
        Page: p ?? page,
        PageSize: ps ?? pageSize,
      };
      if (keyword) {
        params.Search = keyword;
      }
      Apis.QueryOsUser(params)
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
    setEditingOsUser(null);
    setModalOpen(true);
  };

  const openEditModal = (osUser: OsUser) => {
    setEditingOsUser(osUser);
    setModalOpen(true);
  };

  const handleFormSuccess = () => {
    app.message.success(editingOsUser ? '更新成功' : '创建成功');
    setModalOpen(false);
    setEditingOsUser(null);
    fetchList(editingOsUser ? page : 1, pageSize);
    if (!editingOsUser) setPage(1);
  };

  const handleDelete = (uid: string) => {
    Apis.DeleteOsUser({ Uid: uid }).then((res) => {
      if (res.Code === 0) {
        app.message.success('删除成功');
        fetchList(page, pageSize);
      } else {
        app.message.warning(res.Msg);
      }
    });
  };

  const columns: TableColumnsType<OsUser> = [
    { title: '账号名称', dataIndex: 'Name', key: 'Name', render: (value: string) => value || '-' },
    {
      title: '用户名',
      dataIndex: 'Username',
      key: 'Username',
      render: (value: string) => <Typography.Text copyable>{value}</Typography.Text>,
    },
    {
      title: '凭据状态',
      key: 'credentials',
      width: 280,
      render: (_, record) => <CredentialStatus osUser={record} />,
    },
    { title: '创建时间', dataIndex: 'Ctime', key: 'Ctime', width: 180, render: (value: string) => value || '-' },
    {
      title: '操作',
      key: 'actions',
      width: 160,
      render: (_, record) => (
        <Space>
          <Button type="link" size="small" icon={<EditOutlined />} onClick={() => openEditModal(record)}>
            编辑
          </Button>
          <Popconfirm title="确定删除该主机账号？" onConfirm={() => handleDelete(record.Uid)}>
            <Button type="link" size="small" danger icon={<DeleteOutlined />}>
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
          新建主机账号
        </Button>
        <Input.Search
          placeholder="搜索账号名称、登录用户名..."
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

      <OsUserFormModal
        open={modalOpen}
        editingOsUser={editingOsUser}
        onCancel={() => {
          setModalOpen(false);
          setEditingOsUser(null);
        }}
        onSuccess={handleFormSuccess}
      />
    </div>
  );
}
