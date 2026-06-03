import PersonalApi, { type ReqCreateHost, type ReqUpdateHost } from "@/apis/PersonalApi";
import type { Host } from "@/utils/type";
import { Button, Card, Col, Form, Input, InputNumber, Modal, Pagination, Popconfirm, Row, Select, Space, Typography, Flex } from "antd";
import { DesktopOutlined, PlusOutlined, EditOutlined, DeleteOutlined, CodeFilled } from "@ant-design/icons";
import { useEffect, useState } from "react";
import { useUser } from "@/contexts/UserContext";
import useApp from "antd/es/app/useApp";

const protocolInfo: Record<string, { icon: React.ReactNode; label: string }> = {
  ssh: { icon: <CodeFilled />, label: "SSH" },
  rdp: { icon: <DesktopOutlined />, label: "RDP" },
};

const PAGE_SIZE = 24;

export default function HostPage() {
  const app = useApp();
  const { isAdmin } = useUser();
  const [hosts, setHosts] = useState<Host[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingHost, setEditingHost] = useState<Host | null>(null);
  const [form] = Form.useForm();

  const fetchHosts = (p: number, ps: number, s?: string) => {
    const kw = s !== undefined ? s : search;
    PersonalApi.QueryHost({ Page: p, PageSize: ps, Search: kw || undefined }).then((data) => {
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
    form.resetFields();
    form.setFieldsValue({ Port: 22, Protocol: "ssh" });
    setModalOpen(true);
  };

  const openEditModal = (host: Host) => {
    setEditingHost(host);
    form.setFieldsValue({
      Name: host.Name,
      Ip: host.Ip,
      Port: host.Port,
      Protocol: host.Protocol,
      User: host.User,
      Password: "",
      PrivateKey: "",
      PrivateKeyPsd: "",
    });
    setModalOpen(true);
  };

  const handleModalOk = () => {
    form.validateFields().then((values) => {
      if (editingHost) {
        const data: ReqUpdateHost = { Uid: editingHost.Uid!, ...values };
        // 编辑时如果密码和密钥都为空则不传
        if (!data.Password) delete data.Password;
        if (!data.PrivateKey) delete data.PrivateKey;
        if (!data.PrivateKeyPsd) delete data.PrivateKeyPsd;
        PersonalApi.UpdateHost(data).then((res) => {
          if (res.Code === 0) {
            app.message.success("更新成功");
            setModalOpen(false);
            fetchHosts(page, PAGE_SIZE);
          } else {
            app.message.warning(res.Msg);
          }
        });
      } else {
        const data: ReqCreateHost = values;
        PersonalApi.CreateHost(data).then((res) => {
          if (res.Code === 0) {
            app.message.success("创建成功");
            setModalOpen(false);
            fetchHosts(1, PAGE_SIZE);
            setPage(1);
          } else {
            app.message.warning(res.Msg);
          }
        });
      }
    });
  };

  const handleDelete = (uid: string) => {
    PersonalApi.DeleteHost({ Uid: uid }).then((res) => {
      if (res.Code === 0) {
        app.message.success("删除成功");
        fetchHosts(page, PAGE_SIZE);
      } else {
        app.message.warning(res.Msg);
      }
    });
  };

  return (
    <div style={{ padding: 24, height: "100%", overflow: "auto", display: "flex", flexDirection: "column" }}>
      <Flex align="center" justify="space-between" gap={12} style={{ marginBottom: 24 }}>
        {isAdmin && (
          <Button type="primary" icon={<PlusOutlined />} onClick={openCreateModal}>
            添加服务器
          </Button>
        )}
        <Input.Search placeholder="搜索名称、IP 或协议…" allowClear value={search} onSearch={handleSearch} onChange={(e) => setSearch(e.target.value)} style={{ maxWidth: 360 }} />
      </Flex>

      <Row gutter={[16, 16]} style={{ alignContent: "flex-start" }}>
        {hosts.map((host) => {
          const info = protocolInfo[host.Protocol] ?? { color: "default", icon: null, label: host.Protocol };
          return (
            <Col key={host.Uid} xs={24} sm={12} lg={8} xl={6}>
              <Card size="small" hoverable>
                <Flex align="center" justify="space-between">
                  <Typography.Text strong>{host.Name || "未命名"}</Typography.Text>
                  {isAdmin && (
                    <Space>
                      <Button type="text" size="small" icon={<EditOutlined />} onClick={() => openEditModal(host)} />
                      <Popconfirm title="确定删除该服务器？" onConfirm={() => handleDelete(host.Uid!)}>
                        <Button type="text" size="small" danger icon={<DeleteOutlined />} />
                      </Popconfirm>
                    </Space>
                  )}
                </Flex>
                <Flex align="center" justify="space-between" style={{ marginTop: 4 }}>
                  <Typography.Text type="secondary">
                    {host.Ip}:{host.Port}
                  </Typography.Text>
                  <Button variant="outlined" color="default" icon={info.icon} onClick={() => window.open("/host/" + host.Uid, "_blank")}>
                    {info.label} 连接
                  </Button>
                </Flex>
              </Card>
            </Col>
          );
        })}
      </Row>

      {hosts.length === 0 && <div style={{ textAlign: "center", padding: "60px 0", color: "#999" }}>暂无资产</div>}

      {total > PAGE_SIZE && (
        <Flex justify="center" style={{ width: "100%", marginTop: 24 }}>
          <Pagination
            current={page}
            pageSize={PAGE_SIZE}
            total={total}
            showSizeChanger
            showTotal={(t) => `共 ${t} 台`}
            pageSizeOptions={["12", "24", "48"]}
            onChange={handlePageChange}
            onShowSizeChange={handlePageChange}
          />
        </Flex>
      )}

      <Modal title={editingHost ? "编辑服务器" : "添加服务器"} open={modalOpen} onOk={handleModalOk} onCancel={() => setModalOpen(false)} destroyOnHidden width={520}>
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item name="Name" label="名称" rules={[{ required: true, message: "请输入服务器名称" }]}>
            <Input placeholder="如：生产服务器" />
          </Form.Item>
          <Form.Item name="Ip" label="IP 地址" rules={[{ required: true, message: "请输入 IP 地址" }]}>
            <Input placeholder="如：192.168.1.100" />
          </Form.Item>
          <Form.Item name="Port" label="端口" rules={[{ required: true, message: "请输入端口" }]}>
            <InputNumber min={1} max={65535} style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item name="Protocol" label="协议" rules={[{ required: true, message: "请选择协议" }]}>
            <Select
              options={[
                { value: "ssh", label: "SSH" },
                { value: "rdp", label: "RDP" },
              ]}
            />
          </Form.Item>
          <Form.Item name="User" label="登录用户" rules={[{ required: true, message: "请输入登录用户名" }]}>
            <Input placeholder="如：root" />
          </Form.Item>
          <Form.Item name="Password" label="密码" extra={editingHost ? "留空则不修改" : undefined}>
            <Input.Password placeholder={editingHost ? "留空则不修改" : "登录密码"} />
          </Form.Item>
          <Form.Item name="PrivateKey" label="私钥" extra={editingHost ? "留空则不修改" : undefined}>
            <Input.TextArea rows={3} placeholder={editingHost ? "留空则不修改" : "SSH 私钥内容"} />
          </Form.Item>
          <Form.Item name="PrivateKeyPsd" label="私钥密码" extra={editingHost ? "留空则不修改" : undefined}>
            <Input.Password placeholder={editingHost ? "留空则不修改" : "私钥密码（如有）"} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
