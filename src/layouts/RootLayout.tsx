import { useEffect, useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router";
import {
  Button,
  Dropdown,
  Form,
  Input,
  Layout,
  Modal,
  Space,
  type MenuProps,
} from "antd";
import { UserOutlined, LogoutOutlined, KeyOutlined } from "@ant-design/icons";
import { Apis, type ReqUpdatePassword } from "@/apis/apis";
import type { User } from "@/utils/type";
import useApp from "antd/es/app/useApp";
import styled from "styled-components";
import { UserProvider } from "@/contexts/UserContext";
import { preload, preloads } from "@/routes";

const { Header, Content } = Layout;

const NavBtn = styled.div`
  cursor: pointer;
  padding: 0 16px;
  height: 100%;
  color: #373a40;
  font-size: 16px;
  transition: color 0.15s ease-out;
  user-select: none;

  &:hover {
    color: #222;
    font-weight: bold;
  }
  &.active {
    color: #222;
    font-weight: bold;
  }
`;

const navItems = [
  { key: "host", label: "服务器", needAdmin: false },
  { key: "user", label: "用户管理", needAdmin: true },
];

type UpdatePasswordForm = ReqUpdatePassword & {
  ConfirmPassword: string;
};

export const RootLayout = () => {
  const app = useApp();
  const nav = useNavigate();
  const loc = useLocation();
  const [user, setUser] = useState<User | null>(null);
  const [psdOpen, setPsdOpen] = useState(false);
  const [psdForm] = Form.useForm<UpdatePasswordForm>();

  const activeKey = loc.pathname.startsWith("/user") ? "user" : "host";

  useEffect(() => {
    Apis.GetUserInfo().then((res) => {
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
      const { ...data } = values;
      Apis.UpdatePassword(data).then((res) => {
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
          boxShadow: "0 1px 4px rgba(0, 0, 0, 0.08)",
          padding: "0 24px",
          height: 56,
          position: "relative",
          zIndex: 10,
        }}
      >
        <Space size={8}>
          <Link
            to="/"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 2,
              textDecoration: "none",
              marginRight: 24,
            }}
          >
            <img src="/icon.svg" width={28} />
            <span
              style={{
                fontSize: 24,
                color: "#333",
                fontWeight: "bold",
                userSelect: "none",
              }}
            >
              PJUMP
            </span>
          </Link>
          {navItems
            .filter((item) => !item.needAdmin || user?.IsAdmin)
            .map((item) => (
              <NavBtn
                key={item.key}
                className={activeKey === item.key ? "active" : ""}
                onClick={() => handleNavClick(item.key)}
                onMouseEnter={() => {
                  if (item.key === "user") preload(preloads.userPage);
                }}
              >
                {item.label}
              </NavBtn>
            ))}
        </Space>

        <Dropdown menu={{ items: dropdownItems }} placement="bottomRight">
          <Button type="text" icon={<UserOutlined />}>
            {user?.Nickname || user?.Username || "用户"}
          </Button>
        </Dropdown>
      </Header>

      <Content style={{ height: "calc(100% - 56px)", overflow: "auto" }}>
        <UserProvider user={user}>
          <Outlet />
        </UserProvider>
      </Content>

      <Modal
        title="修改密码"
        open={psdOpen}
        onOk={handlePsdOk}
        onCancel={() => {
          setPsdOpen(false);
          psdForm.resetFields();
        }}
        destroyOnHidden
      >
        <Form form={psdForm} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item
            name="OldPassword"
            label="旧密码"
            rules={[{ required: true, message: "请输入旧密码" }]}
          >
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
          <Form.Item
            name="ConfirmPassword"
            label="确认新密码"
            dependencies={["NewPassword"]}
            rules={[
              { required: true, message: "请再次输入新密码" },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue("NewPassword") === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error("两次输入的新密码不一致"));
                },
              }),
            ]}
          >
            <Input.Password />
          </Form.Item>
        </Form>
      </Modal>
    </Layout>
  );
};
