import { Outlet, useLocation, useNavigate } from 'react-router';
import {
  AuditOutlined,
  CloudServerOutlined,
  SafetyOutlined,
  TeamOutlined,
  UserSwitchOutlined,
} from '@ant-design/icons';
import { Layout, Menu } from 'antd';

const { Sider, Content } = Layout;

const menuItems = [
  { key: 'host', icon: <CloudServerOutlined />, label: '主机管理' },
  { key: 'os-user', icon: <UserSwitchOutlined />, label: '主机账号' },
  { key: 'user', icon: <TeamOutlined />, label: '用户管理' },
  { key: 'access-group', icon: <SafetyOutlined />, label: '访问规则' },
  {
    key: 'audit',
    icon: <AuditOutlined />,
    label: '日志审计',
    children: [
      { key: 'audit/session', label: '主机会话' },
      { key: 'audit/operation', label: '网站操作' },
      { key: 'audit/login', label: '网站登录' },
    ],
  },
];

export function ConsoleLayout() {
  const nav = useNavigate();
  const loc = useLocation();
  const activeKey = loc.pathname.includes('/console/access-group')
    ? 'access-group'
    : loc.pathname.includes('/console/os-user')
      ? 'os-user'
      : loc.pathname.includes('/console/host')
        ? 'host'
        : loc.pathname.includes('/console/audit/operation')
          ? 'audit/operation'
          : loc.pathname.includes('/console/audit/login')
            ? 'audit/login'
            : loc.pathname.includes('/console/audit')
              ? 'audit/session'
              : 'user';

  return (
    <Layout style={{ height: '100%', background: '#f5f6f8' }}>
      <Sider width={208} theme="light" style={{ borderRight: '1px solid #edf0f2' }}>
        <Menu
          mode="inline"
          selectedKeys={[activeKey]}
          defaultOpenKeys={['audit']}
          items={menuItems}
          onClick={({ key }) => nav(`/console/${key}`)}
          style={{ height: '100%', paddingTop: 12, borderInlineEnd: 0 }}
        />
      </Sider>
      <Content style={{ height: '100%', overflow: 'auto' }}>
        <Outlet />
      </Content>
    </Layout>
  );
}
