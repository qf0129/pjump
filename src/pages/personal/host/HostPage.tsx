import PersonalApi from "@/apis/PersonalApi";
import type { Host } from "@/utils/type";
import { Button, Card, Col, Row, Space, Tag, Typography, Input } from "antd";
import { DesktopOutlined, CodeOutlined, WindowsOutlined, AppleOutlined } from "@ant-design/icons";
import { useEffect, useMemo, useState } from "react";

const { Title, Text } = Typography;

const protocolInfo: Record<string, { color: string; icon: React.ReactNode; label: string }> = {
  ssh: { color: "blue", icon: <CodeOutlined />, label: "SSH" },
  rdp: { color: "green", icon: <DesktopOutlined />, label: "RDP" },
};

function osIcon(os: string | undefined) {
  if (!os) return null;
  const lower = os.toLowerCase();
  if (lower.includes("win")) return <WindowsOutlined style={{ color: "#00a4ef" }} />;
  if (lower.includes("mac") || lower.includes("darwin")) return <AppleOutlined />;
  return null;
}

export default function HostPage() {
  const [hosts, setHosts] = useState<Host[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    PersonalApi.QueryHost({ Page: 1, PageSize: 10 }).then((data) => {
      if (data.Code === 0) {
        setHosts(data.Data.List);
      } else {
        console.error(data.Msg);
      }
    });
  }, []);

  const filtered = useMemo(() => {
    if (!search.trim()) return hosts;
    const kw = search.toLowerCase();
    return hosts.filter((h) => h.Name?.toLowerCase().includes(kw) || h.Ip?.toLowerCase().includes(kw) || h.Protocol?.toLowerCase().includes(kw));
  }, [hosts, search]);

  return (
    <div style={{ padding: "24px 32px", height: "100%", overflow: "auto" }}>
      <div style={{ marginBottom: 24 }}>
        <Title level={3} style={{ marginBottom: 4 }}>
          服务器列表
        </Title>
        <Text type="secondary">共 {filtered.length} 台资产</Text>
      </div>

      <Input.Search placeholder="搜索名称、IP 或协议…" allowClear value={search} onChange={(e) => setSearch(e.target.value)} style={{ marginBottom: 24, maxWidth: 360 }} />

      <Row gutter={[16, 16]}>
        {filtered.map((host) => {
          const info = protocolInfo[host.Protocol] ?? { color: "default", icon: null, label: host.Protocol };
          return (
            <Col key={host.Uid} xs={24} sm={12} lg={8} xl={6}>
              <Card
                hoverable
                size="small"
                style={{ borderRadius: 12 }}
                title={
                  <Space>
                    {osIcon(host.Os)}
                    <Text strong style={{ fontSize: 15 }}>
                      {host.Name || "未命名"}
                    </Text>
                    <Tag color={info.color}>{info.label}</Tag>
                  </Space>
                }
              >
                <div style={{ marginBottom: 12 }}>
                  <Text type="secondary" style={{ fontSize: 13 }}>
                    {host.Ip}:{host.Port}
                  </Text>
                </div>
                <Button type="primary" block icon={info.icon} onClick={() => window.open("/host/" + host.Uid, "_blank")}>
                  连接
                </Button>
              </Card>
            </Col>
          );
        })}
      </Row>

      {filtered.length === 0 && <div style={{ textAlign: "center", padding: "60px 0", color: "#999" }}>{hosts.length === 0 ? "暂无资产" : "未找到匹配的资产"}</div>}
    </div>
  );
}
