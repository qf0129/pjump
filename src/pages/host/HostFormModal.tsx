import { Apis, type ReqCreateHost, type ReqUpdateHost } from '@/apis/apis';
import type { Host, OsUser } from '@/utils/type';
import {
  Button,
  Checkbox,
  Col,
  Flex,
  Form,
  Input,
  InputNumber,
  Modal,
  Radio,
  Row,
  Select,
  Space,
  Typography,
} from 'antd';
import { useRef, useState } from 'react';
import useApp from 'antd/es/app/useApp';
import OsUserFormModal, { type OsUserFormValues } from '../os-user/OsUserFormModal';
import CredentialStatus from '../os-user/CredentialStatus';

interface Props {
  open: boolean;
  editingHost: Host | null;
  onClose: () => void;
  onSuccess: () => void;
}

type OsUserEntry = {
  uid: string;
  name: string;
  username: string;
  hasPassword: boolean;
  hasVncPassword: boolean;
  hasPrivateKey: boolean;
  hasPrivateKeyPsd: boolean;
};

export default function HostFormModal({ open, editingHost, onClose, onSuccess }: Props) {
  const app = useApp();
  const [form] = Form.useForm();
  const [allOsUsers, setAllOsUsers] = useState<OsUser[]>([]);
  const [osUserEntries, setOsUserEntries] = useState<OsUserEntry[]>([]);
  const [osUserModalOpen, setOsUserModalOpen] = useState(false);
  const [editingOsUser, setEditingOsUser] = useState<OsUser | null>(null);
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
        OsType: 'linux',
      });
      setOsUserEntries([]);
      setSelectKey(0);
      origUidsRef.current = new Set();
      hostFieldsRef.current = null;
      refreshAllOsUsers();
    } else {
      setLoading(true);
      setSelectKey(0);
      Promise.all([Apis.QueryHost({ Uid: editingHost.Uid }), Apis.QueryHostOsUser({ HostUid: editingHost.Uid! })]).then(
        ([hostData, osUserData]) => {
          if (hostData.Code === 0 && hostData.Data.List.length > 0) {
            const fresh = hostData.Data.List[0];
            form.setFieldsValue({
              Name: fresh.Name,
              Ip: fresh.Ip,
              OsType: fresh.OsType || 'linux',
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
              OsType: fresh.OsType || 'linux',
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
                name: u.Name || u.Username,
                username: u.Username,
                hasPassword: u.HasPassword,
                hasVncPassword: u.HasVncPassword,
                hasPrivateKey: u.HasPrivateKey,
                hasPrivateKeyPsd: u.HasPrivateKeyPsd,
              }))
            );
            origUidsRef.current = new Set(users.map((u) => u.Uid));
          }
          setLoading(false);
        }
      );
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
      {
        uid,
        name: src.Name || src.Username,
        username: src.Username,
        hasPassword: src.HasPassword,
        hasVncPassword: src.HasVncPassword,
        hasPrivateKey: src.HasPrivateKey,
        hasPrivateKeyPsd: src.HasPrivateKeyPsd,
      },
    ]);
    setSelectKey((k) => k + 1);
  };

  const removeOsUser = (uid: string) => {
    setOsUserEntries((prev) => prev.filter((e) => e.uid !== uid));
  };

  const openNewOsUserModal = () => {
    setEditingOsUser(null);
    setOsUserModalOpen(true);
  };

  const openEditOsUserModal = (uid: string) => {
    const src = allOsUsers.find((u) => u.Uid === uid);
    if (!src) return;
    setEditingOsUser(src);
    setOsUserModalOpen(true);
  };

  const handleOsUserSaved = (uid: string, vals: OsUserFormValues) => {
    if (editingOsUser) {
      setOsUserEntries((prev) =>
        prev.map((e) =>
          e.uid === uid
            ? {
                uid,
                name: vals.name || vals.username,
                username: vals.username,
                hasPassword: vals.clearPassword ? false : e.hasPassword || !!vals.password,
                hasVncPassword: vals.clearVncPassword
                  ? false
                  : e.hasVncPassword || !!vals.vncPassword || !!vals.password,
                hasPrivateKey: vals.clearPrivateKey ? false : e.hasPrivateKey || !!vals.privateKey,
                hasPrivateKeyPsd: vals.clearPrivateKeyPsd ? false : e.hasPrivateKeyPsd || !!vals.privateKeyPsd,
              }
            : e
        )
      );
    } else {
      setOsUserEntries((prev) => [
        ...prev,
        {
          uid,
          name: vals.name || vals.username,
          username: vals.username,
          hasPassword: !!vals.password,
          hasVncPassword: !!vals.vncPassword || !!vals.password,
          hasPrivateKey: !!vals.privateKey,
          hasPrivateKeyPsd: !!vals.privateKeyPsd,
        },
      ]);
      setSelectKey((k) => k + 1);
    }
    setOsUserModalOpen(false);
    refreshAllOsUsers();
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
          if (hostFields.Name !== origHost.Name) updateData.Name = hostFields.Name;
          if (hostFields.Ip !== origHost.Ip) updateData.Ip = hostFields.Ip;
          if ((hostFields.OsType || '') !== origHost.OsType) updateData.OsType = hostFields.OsType || '';
          if (hostFields.SSHPort !== origHost.SSHPort) updateData.SSHPort = hostFields.SSHPort;
          if (hostFields.RDPPort !== origHost.RDPPort) updateData.RDPPort = hostFields.RDPPort;
          if (hostFields.VNCPort !== origHost.VNCPort) updateData.VNCPort = hostFields.VNCPort;
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

        app.message.success('更新成功');
        onSuccess();
      } else {
        const data: ReqCreateHost = {
          Name: hostFields.Name,
          Ip: hostFields.Ip,
          OsType: hostFields.OsType || '',
          SSHPort: hostFields.SSHPort || 0,
          RDPPort: hostFields.RDPPort || 0,
          VNCPort: hostFields.VNCPort || 0,
          OsUserUids: osUserUids.length > 0 ? osUserUids : undefined,
        };
        Apis.CreateHost(data).then((res) => {
          if (res.Code === 0) {
            app.message.success('创建成功');
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
        title={editingHost ? '编辑主机' : '添加主机'}
        open={open}
        onOk={handleOk}
        onCancel={handleClose}
        afterOpenChange={(visible) => {
          if (visible) handleOpen();
        }}
        destroyOnHidden
        width={720}
        confirmLoading={loading}
        // loading={loading}
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item name="Name" label="名称" rules={[{ required: true, message: '请输入主机名称' }]}>
            <Input placeholder="如：生产服务器" />
          </Form.Item>
          <Row gutter={12}>
            <Col span={12}>
              <Form.Item name="Ip" label="主机地址" rules={[{ required: true, message: '请输入 IP 地址' }]}>
                <Input placeholder="如：192.168.1.100 或 example.com" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="OsType" label="操作系统">
                <Radio.Group
                  optionType="button"
                  buttonStyle="solid"
                  options={[
                    { value: 'linux', label: 'Linux' },
                    { value: 'windows', label: 'Windows' },
                    { value: 'macos', label: 'MacOS' },
                    { value: 'other', label: 'Other' },
                  ]}
                />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={12} style={{ marginBottom: 16 }}>
            {(['SSH', 'RDP', 'VNC'] as const).map((proto) => {
              const enableName = `enable${proto}`;
              const portName = `${proto}Port`;
              const defaultPort = proto === 'SSH' ? 22 : proto === 'RDP' ? 3389 : 5900;
              return (
                <Col span={8} key={proto}>
                  <Form.Item name={enableName} valuePropName="checked" style={{ marginBottom: 0 }}>
                    <Checkbox
                      onChange={(e) => {
                        form.setFieldValue(portName, e.target.checked ? defaultPort : 0);
                      }}
                    >
                      {proto}端口
                    </Checkbox>
                  </Form.Item>
                  <Form.Item noStyle shouldUpdate={(prev, cur) => prev[enableName] !== cur[enableName]}>
                    {({ getFieldValue }) => (
                      <Form.Item name={portName} style={{ marginBottom: 0, flex: 1 }}>
                        <InputNumber
                          min={0}
                          max={65535}
                          disabled={!getFieldValue(enableName)}
                          style={{ width: '100%' }}
                          placeholder={String(defaultPort)}
                        />
                      </Form.Item>
                    )}
                  </Form.Item>
                </Col>
              );
            })}
          </Row>

          <Typography.Text strong style={{ display: 'block', marginBottom: 8 }}>
            主机账号
          </Typography.Text>
          {osUserEntries.map((entry) => (
            <Flex
              key={entry.uid}
              align="center"
              justify="space-between"
              style={{
                marginBottom: 4,
                padding: '4px 8px',
                background: '#fafafa',
                borderRadius: 4,
              }}
            >
              <Typography.Text>
                {entry.name} <Typography.Text type="secondary">({entry.username})</Typography.Text>
              </Typography.Text>
              <CredentialStatus
                mode="configured"
                osUser={{
                  HasPassword: entry.hasPassword,
                  HasVncPassword: entry.hasVncPassword,
                  HasPrivateKey: entry.hasPrivateKey,
                  HasPrivateKeyPsd: entry.hasPrivateKeyPsd,
                }}
              />
              <Space>
                <Button type="link" size="small" onClick={() => openEditOsUserModal(entry.uid)}>
                  编辑
                </Button>
                <Button type="link" danger size="small" onClick={() => removeOsUser(entry.uid)}>
                  删除
                </Button>
              </Space>
            </Flex>
          ))}
          <Select
            key={selectKey}
            showSearch={{
              filterOption: (input, option) =>
                ((option?.label as string) || '').toLowerCase().includes(input.toLowerCase()),
            }}
            placeholder="选择主机账号"
            style={{ width: '50%', marginTop: 8 }}
            onChange={(val) => {
              if (val === '__new__') {
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
                  label: `${u.Name || u.Username} (${u.Username})`,
                })),
              { value: '__new__', label: '＋ 新建主机账号' },
            ]}
          />
        </Form>
      </Modal>

      <OsUserFormModal
        open={osUserModalOpen}
        editingOsUser={editingOsUser}
        onCancel={() => setOsUserModalOpen(false)}
        onSuccess={handleOsUserSaved}
      />
    </>
  );
}
