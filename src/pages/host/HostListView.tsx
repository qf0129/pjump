import type { Host } from '@/utils/type';
import {
  Button,
  Card,
  Checkbox,
  Col,
  Flex,
  Input,
  Modal,
  Pagination,
  Row,
  Space,
  Table,
  Tag,
  Typography,
  type TableColumnsType,
} from 'antd';
import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import { useEffect, useState } from 'react';
import useApp from 'antd/es/app/useApp';
import HostFormModal from './HostFormModal';
import { Apis } from '@/apis/apis';

const PAGE_SIZE = 24;

type HostListViewProps = {
  mode: 'mine' | 'manage';
};

export default function HostListView({ mode }: HostListViewProps) {
  const app = useApp();
  const [hosts, setHosts] = useState<Host[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(PAGE_SIZE);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingHost, setEditingHost] = useState<Host | null>(null);
  const [formKey, setFormKey] = useState(0);
  const [deleteTarget, setDeleteTarget] = useState<Host | null>(null);
  const [deleteOsUser, setDeleteOsUser] = useState(false);
  const isManage = mode === 'manage';

  const fetchHosts = (p: number, ps: number, s?: string) => {
    const kw = s !== undefined ? s : search;
    Apis.QueryHost({
      Page: p,
      PageSize: ps,
      Search: kw || undefined,
    }).then((data) => {
      if (data.Code === 0) {
        setHosts(data.Data.List ?? []);
        setTotal(data.Data.Total ?? 0);
      } else {
        app.message.warning(data.Msg);
      }
    });
  };

  useEffect(() => {
    fetchHosts(1, PAGE_SIZE);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSearch = (value: string) => {
    setSearch(value);
    setPage(1);
    fetchHosts(1, pageSize, value);
  };

  const handlePageChange = (p: number, ps: number) => {
    setPage(p);
    setPageSize(ps);
    fetchHosts(p, ps);
  };

  const openCreateModal = () => {
    setEditingHost(null);
    setFormKey((k) => k + 1);
    setModalOpen(true);
  };

  const openEditModal = (host: Host) => {
    setEditingHost(host);
    setFormKey((k) => k + 1);
    setModalOpen(true);
  };

  const handleFormSuccess = () => {
    setModalOpen(false);
    const wasEdit = !!editingHost;
    setEditingHost(null);
    if (wasEdit) {
      fetchHosts(page, pageSize);
    } else {
      fetchHosts(1, pageSize);
      setPage(1);
    }
  };

  const handleDeleteClick = (host: Host) => {
    setDeleteTarget(host);
    setDeleteOsUser(false);
  };

  const handleDeleteConfirm = () => {
    if (!deleteTarget) return;
    Apis.DeleteHost({
      Uid: deleteTarget.Uid,
      DeleteOsUser: deleteOsUser,
    }).then((res) => {
      if (res.Code === 0) {
        app.message.success('删除成功');
        setDeleteTarget(null);
        fetchHosts(page, pageSize);
      } else {
        app.message.warning(res.Msg);
      }
    });
  };

  const renderProtocolTags = (host: Host) => {
    const hasSSH = (host.SSHPort ?? 0) > 0;
    const hasRDP = (host.RDPPort ?? 0) > 0;
    const hasVNC = (host.VNCPort ?? 0) > 0;
    return (
      <Space size={0}>
        {hasSSH && <Tag color="blue">SSH:{host.SSHPort}</Tag>}
        {hasRDP && <Tag color="green">RDP:{host.RDPPort}</Tag>}
        {hasVNC && <Tag color="orange">VNC:{host.VNCPort}</Tag>}
        {!hasSSH && !hasRDP && !hasVNC && <Tag>未配置</Tag>}
      </Space>
    );
  };

  const manageColumns: TableColumnsType<Host> = [
    { title: '名称', dataIndex: 'Name', width: 180, render: (value: string) => value || '未命名' },
    {
      title: '地址',
      dataIndex: 'Ip',
      width: 180,
      render: (value: string) => <Typography.Text copyable>{value}</Typography.Text>,
    },
    { title: '操作系统', dataIndex: 'OsType', width: 120, render: (value: string) => value || '-' },
    { title: '协议端口', key: 'protocols', render: (_, record) => renderProtocolTags(record) },
    {
      title: '操作',
      key: 'actions',
      width: 220,
      render: (_, record) => (
        <Space>
          <Button type="link" size="small" onClick={() => window.open('/host/' + record.Uid, '_blank')}>
            连接
          </Button>
          <Button type="link" size="small" icon={<EditOutlined />} onClick={() => openEditModal(record)}>
            编辑
          </Button>
          <Button type="link" size="small" danger icon={<DeleteOutlined />} onClick={() => handleDeleteClick(record)}>
            删除
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div
      style={{
        padding: 24,
        height: '100%',
        overflow: 'auto',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Flex align="center" justify="space-between" gap={12} style={{ marginBottom: 24 }}>
        {isManage ? (
          <Button type="primary" icon={<PlusOutlined />} onClick={openCreateModal}>
            添加主机
          </Button>
        ) : (
          <div />
        )}
        <Input.Search
          placeholder="搜索名称、地址…"
          allowClear
          value={search}
          onSearch={handleSearch}
          onChange={(e) => setSearch(e.target.value)}
          style={{ maxWidth: 360 }}
        />
      </Flex>

      {isManage ? (
        <Table
          rowKey="Uid"
          columns={manageColumns}
          dataSource={hosts}
          pagination={{
            current: page,
            pageSize,
            total,
            showSizeChanger: true,
            showTotal: (t) => `共 ${t} 台`,
            pageSizeOptions: ['12', '24', '48'],
            onChange: handlePageChange,
          }}
        />
      ) : (
        <>
          <Row gutter={[16, 16]} style={{ alignContent: 'flex-start' }}>
            {hosts.map((host) => (
              <Col key={host.Uid} xs={24} sm={12} lg={8} xl={6}>
                <Card size="small" styles={{ body: { borderRadius: 10 } }}>
                  <Flex align="center" justify="space-between">
                    <Typography.Text strong ellipsis>
                      {host.Name || '未命名'}
                    </Typography.Text>
                    {renderProtocolTags(host)}
                  </Flex>
                  <Flex align="center" justify="space-between" style={{ marginTop: 12 }}>
                    <Typography.Text type="secondary" copyable ellipsis>
                      {host.Ip}
                    </Typography.Text>
                    <Button
                      color="primary"
                      variant="filled"
                      size="small"
                      onClick={() => window.open('/host/' + host.Uid, '_blank')}
                    >
                      连接 ➔
                    </Button>
                  </Flex>
                </Card>
              </Col>
            ))}
          </Row>

          {hosts.length === 0 && <div style={{ textAlign: 'center', padding: '60px 0', color: '#999' }}>暂无资产</div>}
        </>
      )}

      {!isManage && total > pageSize && (
        <Flex justify="center" style={{ width: '100%', marginTop: 24 }}>
          <Pagination
            current={page}
            pageSize={pageSize}
            total={total}
            showSizeChanger
            showTotal={(t) => `共 ${t} 台`}
            pageSizeOptions={['12', '24', '48']}
            onChange={handlePageChange}
            onShowSizeChange={handlePageChange}
          />
        </Flex>
      )}

      {isManage && (
        <>
          <HostFormModal
            key={formKey}
            open={modalOpen}
            editingHost={editingHost}
            onClose={() => {
              setModalOpen(false);
              setEditingHost(null);
            }}
            onSuccess={handleFormSuccess}
          />

          <Modal
            title="确认删除"
            open={!!deleteTarget}
            onOk={handleDeleteConfirm}
            onCancel={() => setDeleteTarget(null)}
            okText="确认删除"
            cancelText="取消"
            okButtonProps={{ danger: true }}
          >
            <Typography.Text>
              确定要删除主机
              <Typography.Text strong>{deleteTarget?.Name || deleteTarget?.Ip || '未知'}</Typography.Text> 吗？
            </Typography.Text>
            <div style={{ marginTop: 12 }}>
              <Checkbox checked={deleteOsUser} onChange={(e) => setDeleteOsUser(e.target.checked)}>
                同时删除关联的主机账号
              </Checkbox>
            </div>
          </Modal>
        </>
      )}
    </div>
  );
}
