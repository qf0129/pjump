import type { Host } from '@/utils/type';
import { Button, Card, Checkbox, Col, Flex, Input, Modal, Pagination, Row, Space, Tag, Typography } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { useEffect, useState } from 'react';
import { useUser } from '@/contexts/UserContext';
import useApp from 'antd/es/app/useApp';
import HostFormModal from './HostFormModal';
import { Apis } from '@/apis/apis';

const PAGE_SIZE = 24;

export default function HostPage() {
  const app = useApp();
  const { isAdmin } = useUser();
  const [hosts, setHosts] = useState<Host[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingHost, setEditingHost] = useState<Host | null>(null);
  const [formKey, setFormKey] = useState(0);
  const [deleteTarget, setDeleteTarget] = useState<Host | null>(null);
  const [deleteOsUser, setDeleteOsUser] = useState(false);

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
  }, []);

  const handleSearch = (value: string) => {
    setSearch(value);
    setPage(1);
    fetchHosts(1, PAGE_SIZE, value);
  };

  const handlePageChange = (p: number, ps: number) => {
    setPage(p);
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
      fetchHosts(page, PAGE_SIZE);
    } else {
      fetchHosts(1, PAGE_SIZE);
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
      Uid: deleteTarget.Uid!,
      DeleteOsUser: deleteOsUser,
    }).then((res) => {
      if (res.Code === 0) {
        app.message.success('删除成功');
        setDeleteTarget(null);
        fetchHosts(page, PAGE_SIZE);
      } else {
        app.message.warning(res.Msg);
      }
    });
  };

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
        {isAdmin && (
          <Button type="primary" icon={<PlusOutlined />} onClick={openCreateModal}>
            添加服务器
          </Button>
        )}
        <Input.Search
          placeholder="搜索名称、IP…"
          allowClear
          value={search}
          onSearch={handleSearch}
          onChange={(e) => setSearch(e.target.value)}
          style={{ maxWidth: 360 }}
        />
      </Flex>

      <Row gutter={[16, 16]} style={{ alignContent: 'flex-start' }}>
        {hosts.map((host) => {
          const hasSSH = (host.SSHPort ?? 0) > 0;
          const hasRDP = (host.RDPPort ?? 0) > 0;
          const hasVNC = (host.VNCPort ?? 0) > 0;
          return (
            <Col key={host.Uid} xs={24} sm={12} lg={8} xl={6}>
              <Card size="small">
                <Flex align="center" justify="space-between">
                  <Typography.Text strong>{host.Name || '未命名'}</Typography.Text>
                  <Space size={0}>
                    {isAdmin && (
                      <>
                        <Button type="text" size="small" icon={<EditOutlined />} onClick={() => openEditModal(host)} />
                        <Button type="text" size="small" danger icon={<DeleteOutlined />} onClick={() => handleDeleteClick(host)} />
                      </>
                    )}
                    {hasSSH && <Tag color="blue">SSH</Tag>}
                    {hasRDP && <Tag color="green">RDP</Tag>}
                    {hasVNC && <Tag color="orange">VNC</Tag>}
                    {!hasSSH && !hasRDP && !hasVNC && <Tag>未配置</Tag>}
                  </Space>
                </Flex>
                <Flex align="center" justify="space-between" style={{ marginTop: 12 }}>
                  <Typography.Text type="secondary" copyable>
                    {host.Ip}
                  </Typography.Text>
                  <Button color="primary" variant="filled" size="small" onClick={() => window.open('/host/' + host.Uid, '_blank')}>
                    连接 ➔
                  </Button>
                </Flex>
                <Flex justify="right"></Flex>
              </Card>
            </Col>
          );
        })}
      </Row>

      {hosts.length === 0 && <div style={{ textAlign: 'center', padding: '60px 0', color: '#999' }}>暂无资产</div>}

      {total > PAGE_SIZE && (
        <Flex justify="center" style={{ width: '100%', marginTop: 24 }}>
          <Pagination
            current={page}
            pageSize={PAGE_SIZE}
            total={total}
            showSizeChanger
            showTotal={(t) => `共 ${t} 台`}
            pageSizeOptions={['12', '24', '48']}
            onChange={handlePageChange}
            onShowSizeChange={handlePageChange}
          />
        </Flex>
      )}

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
          确定要删除服务器 <Typography.Text strong>{deleteTarget?.Name || deleteTarget?.Ip || '未知'}</Typography.Text> 吗？
        </Typography.Text>
        <div style={{ marginTop: 12 }}>
          <Checkbox checked={deleteOsUser} onChange={(e) => setDeleteOsUser(e.target.checked)}>
            同时删除关联的系统用户
          </Checkbox>
        </div>
      </Modal>
    </div>
  );
}
