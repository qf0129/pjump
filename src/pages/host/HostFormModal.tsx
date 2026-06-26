import {
  Apis,
  type ReqCreateHost,
  type ReqUpdateHost,
  type ReqUpdateOsUser,
} from "@/apis/apis";
import type { Host, OsUser } from "@/utils/type";
import {
  Button,
  Checkbox,
  Col,
  Flex,
  Form,
  Input,
  InputNumber,
  Modal,
  Row,
  Select,
  Space,
  Typography,
} from "antd";
import { useRef, useState } from "react";
import useApp from "antd/es/app/useApp";

interface Props {
  open: boolean;
  editingHost: Host | null;
  onClose: () => void;
  onSuccess: () => void;
}

type OsUserEntry = { uid: string; name: string; user: string };

export default function HostFormModal({
  open,
  editingHost,
  onClose,
  onSuccess,
}: Props) {
  const app = useApp();
  const [form] = Form.useForm();
  const [allOsUsers, setAllOsUsers] = useState<OsUser[]>([]);
  const [osUserEntries, setOsUserEntries] = useState<OsUserEntry[]>([]);
  const [osUserModalOpen, setOsUserModalOpen] = useState(false);
  const [osUserModalMode, setOsUserModalMode] = useState<"new" | "edit">("new");
  const [editingOsUserUid, setEditingOsUserUid] = useState<string | null>(null);
  const [osUserForm] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [selectKey, setSelectKey] = useState(0);
  const origUidsRef = useRef<Set<string>>(new Set());
  const hostFieldsRef = useRef<{
    Name: string;
    Ip: string;
    OsType: string;
    SSHPort: number;
    RDPPort: number;
    VNCPort: number;
    enableSSH: boolean;
    enableRDP: boolean;
    enableVNC: boolean;
  } | null>(null);

  const refreshAllOsUsers = () => {
    Apis.QueryOsUser({ Page: 1, PageSize: 999 }).then((data) => {
      if (data.Code === 0) setAllOsUsers(data.Data.List ?? []);
    });
  };

  // ---- modal open/close ----

  const handleOpen = () => {
    if (!editingHost) {
      form.resetFields();
      form.setFieldsValue({
        enableSSH: false,
        enableRDP: false,
        enableVNC: false,
        SSHPort: 0,
        RDPPort: 0,
        VNCPort: 0,
      });
      setOsUserEntries([]);
      setSelectKey(0);
      origUidsRef.current = new Set();
      hostFieldsRef.current = null;
      refreshAllOsUsers();
    } else {
      setLoading(true);
      setSelectKey(0);
      Promise.all([
        Apis.QueryHost({ Uid: editingHost.Uid }),
        Apis.QueryHostOsUser({ HostUid: editingHost.Uid! }),
      ]).then(([hostData, osUserData]) => {
        if (hostData.Code === 0 && hostData.Data.List.length > 0) {
          const fresh = hostData.Data.List[0];
          form.setFieldsValue({
            Name: fresh.Name,
            Ip: fresh.Ip,
            OsType: fresh.OsType || "",
            enableSSH: (fresh.SSHPort || 0) > 0,
            enableRDP: (fresh.RDPPort || 0) > 0,
            enableVNC: (fresh.VNCPort || 0) > 0,
            SSHPort: fresh.SSHPort || 0,
            RDPPort: fresh.RDPPort || 0,
            VNCPort: fresh.VNCPort || 0,
          });
          hostFieldsRef.current = {
            Name: fresh.Name,
            Ip: fresh.Ip,
            OsType: fresh.OsType || "",
            SSHPort: fresh.SSHPort || 0,
            RDPPort: fresh.RDPPort || 0,
            VNCPort: fresh.VNCPort || 0,
            enableSSH: (fresh.SSHPort || 0) > 0,
            enableRDP: (fresh.RDPPort || 0) > 0,
            enableVNC: (fresh.VNCPort || 0) > 0,
          };
        }
        if (osUserData.Code === 0) {
          const users = osUserData.Data.List ?? [];
          setOsUserEntries(
            users.map((u) => ({
              uid: u.Uid,
              name: u.Name || u.User,
              user: u.User,
            })),
          );
          origUidsRef.current = new Set(users.map((u) => u.Uid));
        }
        setLoading(false);
      });
      refreshAllOsUsers();
    }
  };

  const handleClose = () => {
    onClose();
  };

  // ---- OsUser operations ----

  const addOsUser = (uid: string) => {
    const src = allOsUsers.find((u) => u.Uid === uid);
    if (!src || osUserEntries.some((e) => e.uid === uid)) return;
    setOsUserEntries((prev) => [
      ...prev,
      { uid, name: src.Name || src.User, user: src.User },
    ]);
    setSelectKey((k) => k + 1);
  };

  const removeOsUser = (uid: string) => {
    setOsUserEntries((prev) => prev.filter((e) => e.uid !== uid));
  };

  const openNewOsUserModal = () => {
    setOsUserModalMode("new");
    setEditingOsUserUid(null);
    osUserForm.resetFields();
    setOsUserModalOpen(true);
  };

  const openEditOsUserModal = (uid: string) => {
    const src = allOsUsers.find((u) => u.Uid === uid);
    if (!src) return;
    setOsUserModalMode("edit");
    setEditingOsUserUid(uid);
    osUserForm.setFieldsValue({
      name: src.Name || "",
      user: src.User || "",
      password: "",
      privateKey: "",
      privateKeyPsd: "",
    });
    setOsUserModalOpen(true);
  };

  const handleOsUserModalOk = () => {
    osUserForm.validateFields().then(async (vals) => {
      if (osUserModalMode === "edit" && editingOsUserUid) {
        const data: ReqUpdateOsUser = { Uid: editingOsUserUid };
        const src = allOsUsers.find((u) => u.Uid === editingOsUserUid);
        if (src) {
          if (vals.name !== (src.Name || "")) data.Name = vals.name || "";
          if (vals.user !== src.User) data.User = vals.user;
        } else {
          if (vals.name) data.Name = vals.name;
          if (vals.user) data.User = vals.user;
        }
        if (vals.password) data.Password = vals.password;
        if (vals.privateKey) data.PrivateKey = vals.privateKey;
        if (vals.privateKeyPsd) data.PrivateKeyPsd = vals.privateKeyPsd;
        const res = await Apis.UpdateOsUser(data);
        if (res.Code === 0) {
          setOsUserEntries((prev) =>
            prev.map((e) =>
              e.uid === editingOsUserUid
                ? {
                    uid: editingOsUserUid,
                    name: vals.name || vals.user,
                    user: vals.user,
                  }
                : e,
            ),
          );
          setOsUserModalOpen(false);
          refreshAllOsUsers();
        } else {
          app.message.warning(res.Msg);
        }
      } else {
        const res = await Apis.CreateOsUser({
          Name: vals.name || vals.user,
          User: vals.user,
          Password: vals.password || "",
          PrivateKey: vals.privateKey || "",
          PrivateKeyPsd: vals.privateKeyPsd || "",
        });
        if (res.Code === 0) {
          setOsUserEntries((prev) => [
            ...prev,
            { uid: res.Data, name: vals.name || vals.user, user: vals.user },
          ]);
          setOsUserModalOpen(false);
          setSelectKey((k) => k + 1);
          refreshAllOsUsers();
        } else {
          app.message.warning(res.Msg);
        }
      }
    });
  };

  // ---- submit ----

  const handleOk = () => {
    form.validateFields().then(async (hostFields) => {
      // 确保未启用的端口为 0
      if (!hostFields.enableSSH) hostFields.SSHPort = 0;
      if (!hostFields.enableRDP) hostFields.RDPPort = 0;
      if (!hostFields.enableVNC) hostFields.VNCPort = 0;

      const osUserUids = osUserEntries.map((e) => e.uid);
      if (editingHost) {
        const origHost = hostFieldsRef.current;
        const updateData: ReqUpdateHost = { Uid: editingHost.Uid! };
        if (origHost) {
          if (hostFields.Name !== origHost.Name)
            updateData.Name = hostFields.Name;
          if (hostFields.Ip !== origHost.Ip) updateData.Ip = hostFields.Ip;
          if ((hostFields.OsType || "") !== origHost.OsType)
            updateData.OsType = hostFields.OsType || "";
          if (hostFields.SSHPort !== origHost.SSHPort)
            updateData.SSHPort = hostFields.SSHPort;
          if (hostFields.RDPPort !== origHost.RDPPort)
            updateData.RDPPort = hostFields.RDPPort;
          if (hostFields.VNCPort !== origHost.VNCPort)
            updateData.VNCPort = hostFields.VNCPort;
        }

        const hostChanged = Object.keys(updateData).length > 1;
        if (hostChanged) {
          const hostRes = await Apis.UpdateHost(updateData);
          if (hostRes.Code !== 0) {
            app.message.warning(hostRes.Msg);
            return;
          }
        }

        const origUids = origUidsRef.current;
        for (const uid of osUserUids) {
          if (!origUids.has(uid))
            await Apis.CreateHostOsUser({
              HostUid: editingHost.Uid!,
              OsUserUid: uid,
            });
        }
        for (const uid of origUids) {
          if (!osUserUids.includes(uid))
            await Apis.DeleteHostOsUser({
              HostUid: editingHost.Uid!,
              OsUserUid: uid,
            });
        }

        app.message.success("更新成功");
        onSuccess();
      } else {
        const data: ReqCreateHost = {
          Name: hostFields.Name,
          Ip: hostFields.Ip,
          OsType: hostFields.OsType || "",
          SSHPort: hostFields.SSHPort || 0,
          RDPPort: hostFields.RDPPort || 0,
          VNCPort: hostFields.VNCPort || 0,
          OsUserUids: osUserUids.length > 0 ? osUserUids : undefined,
        };
        Apis.CreateHost(data).then((res) => {
          if (res.Code === 0) {
            app.message.success("创建成功");
            onSuccess();
          } else {
            app.message.warning(res.Msg);
          }
        });
      }
    });
  };

  return (
    <>
      <Modal
        title={editingHost ? "编辑服务器" : "添加服务器"}
        open={open}
        onOk={handleOk}
        onCancel={handleClose}
        afterOpenChange={(visible) => {
          if (visible) handleOpen();
        }}
        destroyOnHidden
        width={640}
        confirmLoading={loading}
        // loading={loading}
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item
            name="Name"
            label="名称"
            rules={[{ required: true, message: "请输入服务器名称" }]}
          >
            <Input placeholder="如：生产服务器" />
          </Form.Item>
          <Row gutter={12}>
            <Col span={12}>
              <Form.Item
                name="Ip"
                label="IP 地址"
                rules={[{ required: true, message: "请输入 IP 地址" }]}
              >
                <Input placeholder="如：192.168.1.100" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="OsType" label="操作系统">
                <Select
                  allowClear
                  placeholder="选择操作系统"
                  options={[
                    { value: "linux", label: "Linux" },
                    { value: "windows", label: "Windows" },
                    { value: "macos", label: "MacOS" },
                    { value: "other", label: "Other" },
                  ]}
                />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={12} style={{ marginBottom: 16 }}>
            {(["SSH", "RDP", "VNC"] as const).map((proto) => {
              const enableName = `enable${proto}`;
              const portName = `${proto}Port`;
              const defaultPort =
                proto === "SSH" ? 22 : proto === "RDP" ? 3389 : 5900;
              return (
                <Col span={8} key={proto}>
                  <Form.Item
                    name={enableName}
                    valuePropName="checked"
                    style={{ marginBottom: 0 }}
                  >
                    <Checkbox
                      onChange={(e) => {
                        form.setFieldValue(
                          portName,
                          e.target.checked ? defaultPort : 0,
                        );
                      }}
                    >
                      {proto}端口
                    </Checkbox>
                  </Form.Item>
                  <Form.Item
                    noStyle
                    shouldUpdate={(prev, cur) =>
                      prev[enableName] !== cur[enableName]
                    }
                  >
                    {({ getFieldValue }) => (
                      <Form.Item
                        name={portName}
                        style={{ marginBottom: 0, flex: 1 }}
                      >
                        <InputNumber
                          min={0}
                          max={65535}
                          disabled={!getFieldValue(enableName)}
                          style={{ width: "100%" }}
                          placeholder={String(defaultPort)}
                        />
                      </Form.Item>
                    )}
                  </Form.Item>
                </Col>
              );
            })}
          </Row>

          <Typography.Text strong style={{ display: "block", marginBottom: 8 }}>
            系统用户
          </Typography.Text>
          {osUserEntries.map((entry) => (
            <Flex
              key={entry.uid}
              align="center"
              justify="space-between"
              style={{
                marginBottom: 4,
                padding: "4px 8px",
                background: "#fafafa",
                borderRadius: 4,
              }}
            >
              <Typography.Text>
                {entry.name}{" "}
                <Typography.Text type="secondary">
                  ({entry.user})
                </Typography.Text>
              </Typography.Text>
              <Space>
                <Button
                  type="link"
                  size="small"
                  onClick={() => openEditOsUserModal(entry.uid)}
                >
                  编辑
                </Button>
                <Button
                  type="link"
                  danger
                  size="small"
                  onClick={() => removeOsUser(entry.uid)}
                >
                  删除
                </Button>
              </Space>
            </Flex>
          ))}
          <Select
            key={selectKey}
            showSearch={{
              filterOption: (input, option) =>
                ((option?.label as string) || "")
                  .toLowerCase()
                  .includes(input.toLowerCase()),
            }}
            placeholder="选择系统用户"
            style={{ width: "50%", marginTop: 8 }}
            onChange={(val) => {
              if (val === "__new__") {
                openNewOsUserModal();
                return;
              }
              addOsUser(val);
            }}
            options={[
              ...allOsUsers
                .filter((u) => !osUserEntries.some((e) => e.uid === u.Uid))
                .map((u) => ({
                  value: u.Uid,
                  label: `${u.Name || u.User} (${u.User})`,
                })),
              { value: "__new__", label: "＋ 新建系统用户" },
            ]}
          />
        </Form>
      </Modal>

      <Modal
        title={osUserModalMode === "edit" ? "编辑系统用户" : "新建系统用户"}
        open={osUserModalOpen}
        onOk={handleOsUserModalOk}
        onCancel={() => setOsUserModalOpen(false)}
        destroyOnHidden
        width={480}
      >
        <Form form={osUserForm} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item name="name" label="名称">
            <Input placeholder="如：root账号" />
          </Form.Item>
          <Form.Item
            name="user"
            label="登录用户"
            rules={[{ required: true, message: "请输入登录用户名" }]}
          >
            <Input placeholder="如：root" />
          </Form.Item>
          <Form.Item name="password" label="密码">
            <Input.Password
              placeholder={
                osUserModalMode === "edit" ? "留空则不修改" : "登录密码"
              }
            />
          </Form.Item>
          <Form.Item name="privateKey" label="私钥">
            <Input.TextArea
              rows={3}
              placeholder={
                osUserModalMode === "edit" ? "留空则不修改" : "SSH 私钥内容"
              }
            />
          </Form.Item>
          <Form.Item name="privateKeyPsd" label="私钥密码">
            <Input.Password
              placeholder={
                osUserModalMode === "edit" ? "留空则不修改" : "私钥密码（如有）"
              }
            />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}
