import { useEffect, useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router";
import { Button, Dropdown, Form, Input, Layout, Modal, Space, type MenuProps } from "antd";
import { UserOutlined, LogoutOutlined, KeyOutlined } from "@ant-design/icons";
import PersonalApi, { type ReqUpdatePassword } from "@/apis/PersonalApi";
import type { User } from "@/utils/type";
import useApp from "antd/es/app/useApp";

const { Header, Content } = Layout;

const navItems = [
  { key: "host", label: "服务器" },
  { key: "user", label: "用户管理" },
];

export const RootLayout = () => {
  const app = useApp();
  const nav = useNavigate();
  const loc = useLocation();
  const [user, setUser] = useState<User | null>(null);
  const [psdOpen, setPsdOpen] = useState(false);
  const [psdForm] = Form.useForm<ReqUpdatePassword>();

  const activeKey = loc.pathname.startsWith("/user") ? "user" : "host";

  useEffect(() => {
    PersonalApi.GetUserInfo().then((res) => {
      if (res.Code === 0) {
        setUser(res.Data);
      }
    });
  }, []);

  const handleNavClick = (key: string) => {
    nav(`/${key}`);
  };

  const handleLogout = () => {
    nav("/signin");
  };

  const handleUpdatePassword = () => {
    setPsdOpen(true);
  };

  const handlePsdOk = () => {
    psdForm.validateFields().then((values) => {
      PersonalApi.UpdatePassword(values).then((res) => {
        if (res.Code === 0) {
          app.message.success("密码修改成功");
          setPsdOpen(false);
          psdForm.resetFields();
        } else {
          app.message.warning(res.Msg);
        }
      });
    });
  };

  const dropdownItems: MenuProps["items"] = [
    {
      key: "password",
      icon: <KeyOutlined />,
      label: "修改密码",
      onClick: handleUpdatePassword,
    },
    { type: "divider" },
    {
      key: "logout",
      icon: <LogoutOutlined />,
      label: "退出登录",
      onClick: handleLogout,
    },
  ];

  return (
    <Layout style={{ height: "100%" }}>
      <Header
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          background: "#fff",
          borderBottom: "1px solid #f0f0f0",
          padding: "0 24px",
          height: 48,
        }}
      >
        <Space size={0}>
          {navItems.map((item) => (
            <Button key={item.key} type={activeKey === item.key ? "primary" : "text"} onClick={() => handleNavClick(item.key)} style={{ borderRadius: 0 }}>
              {item.label}
            </Button>
          ))}
        </Space>

        <Dropdown menu={{ items: dropdownItems }} placement="bottomRight">
          <Button type="text" icon={<UserOutlined />}>
            {user?.Nickname || user?.Username || "用户"}
          </Button>
        </Dropdown>
      </Header>

      <Content style={{ height: "calc(100% - 48px)", overflow: "auto" }}>
        <Outlet />
      </Content>

      <Modal
        title="修改密码"
        open={psdOpen}
        onOk={handlePsdOk}
        onCancel={() => {
          setPsdOpen(false);
          psdForm.resetFields();
        }}
        destroyOnClose
      >
        <Form form={psdForm} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item name="OldPassword" label="旧密码" rules={[{ required: true, message: "请输入旧密码" }]}>
            <Input.Password />
          </Form.Item>
          <Form.Item
            name="NewPassword"
            label="新密码"
            rules={[
              { required: true, message: "请输入新密码" },
              { min: 5, message: "密码长度至少5位" },
              { max: 20, message: "密码长度不超过20位" },
            ]}
          >
            <Input.Password />
          </Form.Item>
        </Form>
      </Modal>
    </Layout>
  );
};
