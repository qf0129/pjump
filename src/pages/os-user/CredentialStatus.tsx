import type { OsUser } from '@/utils/type';
import { Space, Tag, Tooltip, Typography } from 'antd';

type Props = {
  osUser: Pick<OsUser, 'HasPassword' | 'HasVncPassword' | 'HasPrivateKey' | 'HasPrivateKeyPsd'>;
  mode?: 'all' | 'configured';
};

const credentialItems = [
  { key: 'HasPassword', label: '密码', tip: '密码' },
  { key: 'HasVncPassword', label: 'VNC', tip: 'VNC 密码' },
  { key: 'HasPrivateKey', label: '私钥', tip: '私钥' },
  { key: 'HasPrivateKeyPsd', label: '口令', tip: '私钥密码' },
] as const;

export default function CredentialStatus({ osUser, mode = 'all' }: Props) {
  const configuredItems = credentialItems.filter((item) => osUser[item.key]);

  if (mode === 'configured') {
    if (configuredItems.length === 0) {
      return <Typography.Text type="secondary">未配置凭据</Typography.Text>;
    }
    return (
      <Space size={4} wrap>
        {configuredItems.map((item) => (
          <Tooltip key={item.key} title={`${item.tip}已配置`}>
            <Tag color="success" style={{ marginInlineEnd: 0 }}>
              {item.label}
            </Tag>
          </Tooltip>
        ))}
      </Space>
    );
  }

  const hasAnyCredential = configuredItems.length > 0;

  return (
    <Space size={4} wrap>
      {!hasAnyCredential && (
        <Tooltip title="未配置任何凭据">
          <Tag color="warning" style={{ marginInlineEnd: 0 }}>
            未配置凭据
          </Tag>
        </Tooltip>
      )}
      {credentialItems.map((item) => {
        const configured = osUser[item.key];
        return (
          <Tooltip key={item.key} title={`${item.tip}${configured ? '已配置' : '未配置'}`}>
            <Tag color={configured ? 'success' : 'default'} style={{ marginInlineEnd: 0 }}>
              {item.label}
            </Tag>
          </Tooltip>
        );
      })}
    </Space>
  );
}
