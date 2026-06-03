import PersonalApi from "@/apis/PersonalApi";
import type { Host } from "@/utils/type";
import { Button, Card, Col, Pagination, Row, Space, Tag, Typography, Input, Flex } from "antd";
import { DesktopOutlined, CodeOutlined, WindowsOutlined, AppleOutlined } from "@ant-design/icons";
import { useEffect, useMemo, useState } from "react";

const protocolInfo: Record<string, { color: string; icon: React.ReactNode; label: string }> = {
  ssh: { color: "blue", icon: <CodeOutlined color="#222" />, label: "SSH" },
  rdp: { color: "green", icon: <DesktopOutlined />, label: "RDP" },
};

function osIcon(os: string | undefined) {
  if (!os) return null;
  const lower = os.toLowerCase();
  if (lower.includes("win")) return <WindowsOutlined style={{ color: "#00a4ef" }} />;
  if (lower.includes("mac") || lower.includes("darwin")) return <AppleOutlined />;
  return null;
}

const PAGE_SIZE = 12;

export default function HostPage() {
  const [hosts, setHosts] = useState<Host[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");

  const fetchHosts = (p: number, ps: number) => {
    PersonalApi.QueryHost({ Page: p, PageSize: ps }).then((data) => {
      if (data.Code === 0) {
        setHosts(data.Data.List ?? []);
        setTotal(data.Data.Total ?? 0);
      } else {
        console.error(data.Msg);
      }
    });
  };

  useEffect(() => {
    fetchHosts(1, PAGE_SIZE);
  }, []);

  const filtered = useMemo(() => {
    if (!search.trim()) return hosts;
    const kw = search.toLowerCase();
    return hosts.filter((h) => h.Name?.toLowerCase().includes(kw) || h.Ip?.toLowerCase().includes(kw) || h.Protocol?.toLowerCase().includes(kw));
  }, [hosts, search]);

  const handleSearch = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const handlePageChange = (p: number, ps: number) => {
    setPage(p);
    fetchHosts(p, ps);
  };

  return (
    <div style={{ padding: 24, height: "100%", overflow: "auto", display: "flex", flexDirection: "column" }}>
      <Input.Search placeholder="搜索名称、IP 或协议…" allowClear value={search} onChange={(e) => handleSearch(e.target.value)} style={{ marginBottom: 24, maxWidth: 360 }} />

      <Row gutter={[16, 16]} style={{ flex: 1, alignContent: "flex-start" }}>
        {filtered.map((host) => {
          const info = protocolInfo[host.Protocol] ?? { color: "default", icon: null, label: host.Protocol };
          return (
            <Col key={host.Uid} xs={24} sm={12} lg={8} xl={6}>
              <Card size="small">
                <Flex style={{}} align="center">
                  <Space vertical style={{ flex: 1, fontSize: 16 }}>
                    <Typography.Text strong style={{}}>
                      {host.Name || "未命名"}
                    </Typography.Text>
                    <Typography.Text type="secondary">
                      {host.Ip}:{host.Port}
                    </Typography.Text>
                  </Space>
                  <Button variant="text" color="primary" icon={info.icon} onClick={() => window.open("/host/" + host.Uid, "_blank")}>
                    {info.label} 连接
                  </Button>
                </Flex>
              </Card>
            </Col>
          );
        })}
      </Row>

      {filtered.length === 0 && <div style={{ textAlign: "center", padding: "60px 0", color: "#999" }}>{hosts.length === 0 ? "暂无资产" : "未找到匹配的资产"}</div>}

      {total > PAGE_SIZE && (
        <div style={{ marginTop: 24, textAlign: "center" }}>
          <Pagination
            current={page}
            pageSize={PAGE_SIZE}
            total={total}
            showSizeChanger
            showQuickJumper
            showTotal={(t) => `共 ${t} 台`}
            pageSizeOptions={["12", "24", "48"]}
            onChange={handlePageChange}
            onShowSizeChange={handlePageChange}
          />
        </div>
      )}
    </div>
  );
}
