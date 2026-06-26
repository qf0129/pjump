import { Apis } from "@/apis/apis";
import type { Host, OsUser } from "@/utils/type";
import { Button, Card, Flex, Form, Radio, Typography } from "antd";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router";
import SSHTerminal from "./SSHTerminal";
import RDPClient from "./RDPClient";

type Protocol = "ssh" | "rdp" | "vnc";

const PROTO_INFO: Record<Protocol, { label: string; defaultPort: number }> = {
  ssh: { label: "SSH", defaultPort: 22 },
  rdp: { label: "RDP", defaultPort: 3389 },
  vnc: { label: "VNC", defaultPort: 5900 },
};

export default function ClientPage() {
  const { uid } = useParams<{ uid: string }>();
  const [host, setHost] = useState<Host | null>(null);
  const [osUsers, setOsUsers] = useState<OsUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(false);
  const [connProtocol, setConnProtocol] = useState<Protocol | null>(null);
  const [connOsUserUid, setConnOsUserUid] = useState<string | null>(null);

  // 选择器状态
  const [selProtocol, setSelProtocol] = useState<Protocol | null>(null);
  const [selOsUserUid, setSelOsUserUid] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      Apis.QueryHost({ Uid: uid }),
      Apis.QueryHostOsUser({ HostUid: uid! }),
    ]).then(([hostData, osUserData]) => {
      if (hostData.Code === 0 && hostData.Data.List.length > 0) {
        const h = hostData.Data.List[0];
        setHost(h);
        document.title = h.Name || h.Ip || uid || "连接中";

        const users = osUserData.Code === 0 ? (osUserData.Data.List ?? []) : [];
        setOsUsers(users);

        // 可用协议
        const protocols: Protocol[] = [];
        if ((h.SSHPort ?? 0) > 0) protocols.push("ssh");
        if ((h.RDPPort ?? 0) > 0) protocols.push("rdp");
        if ((h.VNCPort ?? 0) > 0) protocols.push("vnc");

        // 单协议 + 单用户 → 自动连接
        if (protocols.length === 1 && users.length === 1) {
          setConnProtocol(protocols[0]);
          setConnOsUserUid(users[0].Uid);
          setConnecting(true);
        } else {
          setSelProtocol(protocols[0] || null);
          setSelOsUserUid(users[0]?.Uid || null);
        }
      }
      setLoading(false);
    });
  }, [uid]);

  const handleConnect = () => {
    if (!selProtocol || !selOsUserUid) return;
    setConnProtocol(selProtocol);
    setConnOsUserUid(selOsUserUid);
    setConnecting(true);
  };

  // 连接中：更新 favicon、阻止意外关闭
  useEffect(() => {
    if (!connecting || !connProtocol) return;
    const link: HTMLLinkElement =
      (document.querySelector("link[rel~='icon']") as HTMLLinkElement) ||
      document.createElement("link");
    link.rel = "icon";
    if (!link.parentElement) document.head.appendChild(link);
    link.href = connProtocol === "rdp" ? "/rdp.svg" : "/ssh.svg";

    const listener = (e: BeforeUnloadEvent) => {
      e.preventDefault();
    };
    window.addEventListener("beforeunload", listener);
    return () => {
      window.removeEventListener("beforeunload", listener);
    };
  }, [connecting, connProtocol]);

  const clientView = () => {
    if (!connProtocol || !host || !connOsUserUid) return null;
    if (connProtocol === "ssh")
      return <SSHTerminal hostUid={host.Uid!} osUserUid={connOsUserUid} />;
    if (connProtocol === "rdp")
      return <RDPClient hostUid={host.Uid!} osUserUid={connOsUserUid} />;
    return (
      <div style={{ color: "#aaa", padding: 40, textAlign: "center" }}>
        VNC 暂不支持
      </div>
    );
  };

  const availableProtocols = useMemo(() => {
    if (!host) return [] as Protocol[];
    const p: Protocol[] = [];
    if ((host.SSHPort ?? 0) > 0) p.push("ssh");
    if ((host.RDPPort ?? 0) > 0) p.push("rdp");
    if ((host.VNCPort ?? 0) > 0) p.push("vnc");
    return p;
  }, [host]);

  if (loading) {
    return (
      <Flex
        align="center"
        justify="center"
        style={{ height: "100%", background: "#000" }}
      ></Flex>
    );
  }

  if (connecting) {
    return (
      <div style={{ height: "100%", width: "100%", background: "#000" }}>
        {clientView()}
      </div>
    );
  }

  return (
    <div
      style={{
        height: "100%",
        width: "100%",
        background: "#000",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Card
        title={`连接到 ${host?.Name || host?.Ip || uid}`}
        style={{ width: 480 }}
      >
        <Form layout="horizontal" labelCol={{ span: 4 }}>
          <Form.Item label="协议">
            {availableProtocols.length ? (
              <Radio.Group
                value={selProtocol}
                onChange={(e) => setSelProtocol(e.target.value)}
                buttonStyle="solid"
              >
                {availableProtocols.map((p) => (
                  <Radio.Button key={p} value={p}>
                    {PROTO_INFO[p].label}
                  </Radio.Button>
                ))}
              </Radio.Group>
            ) : (
              <Typography.Text type="secondary">未配置协议</Typography.Text>
            )}
          </Form.Item>
          <Form.Item label="系统用户">
            {osUsers.length ? (
              <Radio.Group
                value={selOsUserUid}
                onChange={(e) => setSelOsUserUid(e.target.value)}
                buttonStyle="solid"
              >
                {osUsers.map((u) => (
                  <Radio.Button
                    key={u.Uid}
                    value={u.Uid}
                  >{`${u.Name || u.User} (${u.User})`}</Radio.Button>
                ))}
              </Radio.Group>
            ) : (
              <Typography.Text type="secondary">未配置系统用户</Typography.Text>
            )}
          </Form.Item>
        </Form>
        <Flex justify="end" gap={12}>
          <Button
            onClick={() => {
              try {
                window.close();
              } catch {
                window.history.back();
              }
            }}
          >
            取消
          </Button>
          <Button
            type="primary"
            onClick={handleConnect}
            disabled={!selProtocol || !selOsUserUid}
          >
            连接
          </Button>
        </Flex>
      </Card>
    </div>
  );
}
