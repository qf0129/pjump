import { useEffect, useState } from 'react';
import { Button, Card, Empty, Flex, Input, List, Pagination, Row, Col, Space, Spin, Tag, Typography } from 'antd';
import { Apis } from '@/apis/apis';
import type { AccessGroup, Host } from '@/utils/type';

const PAGE_SIZE = 24;

export default function HostPage() {
  const [groups, setGroups] = useState<AccessGroup[]>([]);
  const [selectedGroupUid, setSelectedGroupUid] = useState<string>();
  const [hosts, setHosts] = useState<Host[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(PAGE_SIZE);
  const [search, setSearch] = useState('');
  const [groupSearch, setGroupSearch] = useState('');
  const [groupLoading, setGroupLoading] = useState(false);
  const [hostLoading, setHostLoading] = useState(false);

  const selectedGroup = groups.find((g) => g.Uid === selectedGroupUid);

  const fetchGroups = (kw?: string) => {
    setGroupLoading(true);
    Apis.QueryMyAccessGroup({ Page: 1, PageSize: 999, Search: kw || undefined })
      .then((res) => {
        if (res.Code !== 0) return;
        const list = res.Data.List ?? [];
        setGroups(list);
        if (list.length > 0) {
          setSelectedGroupUid(list[0].Uid);
        } else {
          setSelectedGroupUid(undefined);
        }
      })
      .finally(() => setGroupLoading(false));
  };

  const fetchHosts = (groupUid: string, p: number, ps: number, s?: string) => {
    const kw = s !== undefined ? s : search;
    setHostLoading(true);
    Apis.QueryAccessGroupHost({ GroupUid: groupUid, Page: kw ? 1 : p, PageSize: kw ? 999 : ps })
      .then((res) => {
        if (res.Code === 0) {
          const list = res.Data.List ?? [];
          const filtered = kw
            ? list.filter((host) => `${host.Name || ''} ${host.Ip || ''}`.toLowerCase().includes(kw.toLowerCase()))
            : list;
          setHosts(filtered);
          setTotal(kw ? filtered.length : (res.Data.Total ?? 0));
        }
      })
      .finally(() => setHostLoading(false));
  };

  useEffect(() => {
    fetchGroups();
  }, []);

  useEffect(() => {
    if (!selectedGroupUid) {
      setHosts([]);
      setTotal(0);
      return;
    }
    setPage(1);
    fetchHosts(selectedGroupUid, 1, pageSize);
  }, [selectedGroupUid]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSelectGroup = (groupUid: string) => {
    setSelectedGroupUid(groupUid);
    setSearch('');
  };

  const handleGroupSearch = (value: string) => {
    setGroupSearch(value);
    setSearch('');
    fetchGroups(value);
  };

  const handleSearch = (value: string) => {
    setSearch(value);
    setPage(1);
    if (selectedGroupUid) fetchHosts(selectedGroupUid, 1, pageSize, value);
  };

  const handlePageChange = (p: number, ps: number) => {
    setPage(p);
    setPageSize(ps);
    if (selectedGroupUid) fetchHosts(selectedGroupUid, p, ps);
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

  return (
    <Flex style={{ height: '100%', background: '#f5f6f8' }}>
      <div style={{ width: 260, padding: 16, borderRight: '1px solid #edf0f2', background: '#fff', overflow: 'auto' }}>
        <Typography.Text strong style={{ display: 'block', marginBottom: 12 }}>
          访问组
        </Typography.Text>
        <Input.Search
          placeholder="搜索访问组..."
          allowClear
          value={groupSearch}
          variant="filled"
          onSearch={handleGroupSearch}
          onChange={(e) => setGroupSearch(e.target.value)}
          style={{ marginBottom: 12 }}
        />
        <Spin spinning={groupLoading}>
          <List
            dataSource={groups}
            locale={{ emptyText: '暂无可访问的访问组' }}
            renderItem={(group) => {
              const active = group.Uid === selectedGroupUid;
              return (
                <List.Item
                  onClick={() => handleSelectGroup(group.Uid)}
                  style={{
                    cursor: 'pointer',
                    padding: '8px 12px',
                    borderRadius: 6,
                    marginBottom: 4,
                    background: active ? '#e6f4ff' : 'transparent',
                    borderBlockEnd: 0,
                    transition: 'all 0.2s',
                  }}
                >
                  <Typography.Text strong ellipsis>
                    {group.Name || '未命名访问组'} ({group.HostCount ?? 0})
                  </Typography.Text>
                </List.Item>
              );
            }}
          />
        </Spin>
      </div>

      <div style={{ flex: 1, padding: 24, overflow: 'auto' }}>
        <Flex align="center" justify="space-between" gap={12} style={{ marginBottom: 24 }}>
          <Space align="center">
            <Typography.Title level={4} style={{ margin: 0 }}>
              {selectedGroup?.Name}
            </Typography.Title>
            {selectedGroup?.Description && (
              <Typography.Text type="secondary" ellipsis style={{ margin: 0 }}>
                ({selectedGroup?.Description})
              </Typography.Text>
            )}
          </Space>
          <Input.Search
            placeholder="搜索名称、地址..."
            allowClear
            value={search}
            onSearch={handleSearch}
            onChange={(e) => setSearch(e.target.value)}
            style={{ maxWidth: 360 }}
            disabled={!selectedGroupUid}
          />
        </Flex>

        <Spin spinning={hostLoading}>
          {selectedGroupUid ? (
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
                          连接
                        </Button>
                      </Flex>
                    </Card>
                  </Col>
                ))}
              </Row>
              {hosts.length === 0 && <Empty description="该访问组暂无主机" style={{ padding: '60px 0' }} />}
              {total > pageSize && (
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
            </>
          ) : (
            <Empty description="暂无可访问的访问组" style={{ padding: '80px 0' }} />
          )}
        </Spin>
      </div>
    </Flex>
  );
}
