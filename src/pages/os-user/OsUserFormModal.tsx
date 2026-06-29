import { Apis, type ReqUpdateOsUser } from '@/apis/apis';
import type { OsUser } from '@/utils/type';
import { Checkbox, Form, Input, Modal, Space } from 'antd';
import useApp from 'antd/es/app/useApp';

const CREDENTIAL_MASK = '******';

export type OsUserFormValues = {
  name?: string;
  username: string;
  password?: string;
  vncPassword?: string;
  privateKey?: string;
  privateKeyPsd?: string;
  clearPassword?: boolean;
  clearVncPassword?: boolean;
  clearPrivateKey?: boolean;
  clearPrivateKeyPsd?: boolean;
};

type Props = {
  open: boolean;
  editingOsUser: OsUser | null;
  onCancel: () => void;
  onSuccess: (uid: string, values: OsUserFormValues) => void;
};

export default function OsUserFormModal({ open, editingOsUser, onCancel, onSuccess }: Props) {
  const app = useApp();
  const [form] = Form.useForm<OsUserFormValues>();
  const isEdit = !!editingOsUser;

  const handleOpen = () => {
    if (editingOsUser) {
      form.setFieldsValue({
        name: editingOsUser.Name || '',
        username: editingOsUser.Username || '',
        password: editingOsUser.HasPassword ? CREDENTIAL_MASK : '',
        vncPassword: editingOsUser.HasVncPassword ? CREDENTIAL_MASK : '',
        privateKey: editingOsUser.HasPrivateKey ? CREDENTIAL_MASK : '',
        privateKeyPsd: editingOsUser.HasPrivateKeyPsd ? CREDENTIAL_MASK : '',
        clearPassword: false,
        clearVncPassword: false,
        clearPrivateKey: false,
        clearPrivateKeyPsd: false,
      });
    } else {
      form.resetFields();
    }
  };

  const handleOk = () => {
    form.validateFields().then(async (vals) => {
      if (editingOsUser) {
        const data: ReqUpdateOsUser = { Uid: editingOsUser.Uid };
        if (vals.name !== (editingOsUser.Name || '')) data.Name = vals.name || '';
        if (vals.username !== editingOsUser.Username) data.Username = vals.username;
        if (vals.clearPassword) data.ClearPassword = true;
        else if (vals.password && vals.password !== CREDENTIAL_MASK) data.Password = vals.password;
        if (vals.clearVncPassword) data.ClearVncPassword = true;
        else if (vals.vncPassword && vals.vncPassword !== CREDENTIAL_MASK) data.VncPassword = vals.vncPassword;
        if (vals.clearPrivateKey) data.ClearPrivateKey = true;
        else if (vals.privateKey && vals.privateKey !== CREDENTIAL_MASK) data.PrivateKey = vals.privateKey;
        if (vals.clearPrivateKeyPsd) data.ClearPrivateKeyPsd = true;
        else if (vals.privateKeyPsd && vals.privateKeyPsd !== CREDENTIAL_MASK) data.PrivateKeyPsd = vals.privateKeyPsd;

        const res = await Apis.UpdateOsUser(data);
        if (res.Code === 0) {
          onSuccess(editingOsUser.Uid, vals);
        } else {
          app.message.warning(res.Msg);
        }
        return;
      }

      const res = await Apis.CreateOsUser({
        Name: vals.name || vals.username,
        Username: vals.username,
        Password: vals.password || '',
        VncPassword: vals.vncPassword || '',
        PrivateKey: vals.privateKey || '',
        PrivateKeyPsd: vals.privateKeyPsd || '',
      });
      if (res.Code === 0) {
        onSuccess(res.Data, vals);
      } else {
        app.message.warning(res.Msg);
      }
    });
  };

  return (
    <Modal
      title={isEdit ? '编辑主机账号' : '新建主机账号'}
      open={open}
      onOk={handleOk}
      onCancel={onCancel}
      afterOpenChange={(visible) => {
        if (visible) handleOpen();
      }}
      destroyOnHidden
      width={480}
    >
      <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
        <Form.Item name="name" label="账号名称">
          <Input placeholder="如：root账号" />
        </Form.Item>
        <Form.Item name="username" label="用户名" rules={[{ required: true, message: '请输入登录用户名' }]}>
          <Input placeholder="如：root, dev" />
        </Form.Item>
        <Form.Item noStyle shouldUpdate={(prev, cur) => prev.clearPassword !== cur.clearPassword}>
          {({ getFieldValue }) => (
            <Space.Compact block>
              <Form.Item name="password" label="密码" style={{ flex: 1 }}>
                <Input.Password
                  disabled={getFieldValue('clearPassword')}
                  placeholder={isEdit ? '留空则不修改' : '登录密码'}
                />
              </Form.Item>
              {isEdit && (
                <Form.Item name="clearPassword" label=" " valuePropName="checked" style={{ marginLeft: 6 }}>
                  <Checkbox>清空</Checkbox>
                </Form.Item>
              )}
            </Space.Compact>
          )}
        </Form.Item>
        <Form.Item noStyle shouldUpdate={(prev, cur) => prev.clearVncPassword !== cur.clearVncPassword}>
          {({ getFieldValue }) => (
            <Space.Compact block>
              <Form.Item name="vncPassword" label="VNC 密码" style={{ flex: 1 }}>
                <Input.Password
                  disabled={getFieldValue('clearVncPassword')}
                  placeholder={isEdit ? '留空则不修改' : '留空则使用登录密码'}
                />
              </Form.Item>
              {isEdit && (
                <Form.Item name="clearVncPassword" label=" " valuePropName="checked" style={{ marginLeft: 6 }}>
                  <Checkbox>清空</Checkbox>
                </Form.Item>
              )}
            </Space.Compact>
          )}
        </Form.Item>
        <Form.Item noStyle shouldUpdate={(prev, cur) => prev.clearPrivateKey !== cur.clearPrivateKey}>
          {({ getFieldValue }) => (
            <Space.Compact block>
              <Form.Item name="privateKey" label="私钥" style={{ flex: 1 }}>
                <Input.TextArea
                  rows={3}
                  disabled={getFieldValue('clearPrivateKey')}
                  placeholder={isEdit ? '留空则不修改' : 'SSH 私钥内容'}
                />
              </Form.Item>
              {isEdit && (
                <Form.Item name="clearPrivateKey" label=" " valuePropName="checked" style={{ marginLeft: 6 }}>
                  <Checkbox>清空</Checkbox>
                </Form.Item>
              )}
            </Space.Compact>
          )}
        </Form.Item>
        <Form.Item noStyle shouldUpdate={(prev, cur) => prev.clearPrivateKeyPsd !== cur.clearPrivateKeyPsd}>
          {({ getFieldValue }) => (
            <Space.Compact block>
              <Form.Item name="privateKeyPsd" label="私钥密码" style={{ flex: 1 }}>
                <Input.Password
                  disabled={getFieldValue('clearPrivateKeyPsd')}
                  placeholder={isEdit ? '留空则不修改' : '私钥密码（如有）'}
                />
              </Form.Item>
              {isEdit && (
                <Form.Item name="clearPrivateKeyPsd" label=" " valuePropName="checked" style={{ marginLeft: 6 }}>
                  <Checkbox>清空</Checkbox>
                </Form.Item>
              )}
            </Space.Compact>
          )}
        </Form.Item>
      </Form>
    </Modal>
  );
}
