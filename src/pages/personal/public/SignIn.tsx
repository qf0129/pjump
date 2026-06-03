import { Button, Form, Input } from "antd";
import { type FormProps } from "antd/es/form/Form";
import type { ReqAuth } from "@/apis/api";
import api from "@/apis/api";
import { useNavigate } from "react-router";
import useApp from "antd/es/app/useApp";
import styled from "styled-components";

const SignInRoot = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background: #f0f2f5;
`;

const SignInCard = styled.div`
  width: 400px;
  padding: 40px 32px 32px;
  border-radius: 8px;
  background-color: #fff;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  text-align: right;
`;

export const SignIn = () => {
  const app = useApp();
  const nav = useNavigate();
  const onFinish: FormProps<ReqAuth>["onFinish"] = (values) => {
    api.SignIn(values).then((res) => {
      if (res.Code === 0) {
        app.message.success("登录成功");
        nav("/");
      } else {
        app.message.warning(res.Msg);
      }
    });
  };

  return (
    <SignInRoot>
      <SignInCard>
        <Form onFinish={onFinish} size="large" labelCol={{ span: 4 }}>
          <Form.Item<ReqAuth> label="账号" name="Username" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item<ReqAuth> label="密码" name="Password" rules={[{ required: true }]}>
            <Input.Password />
          </Form.Item>
          <Form.Item label={null}>
            <Button type="primary" htmlType="submit">
              SignIn
            </Button>
          </Form.Item>
        </Form>
      </SignInCard>
    </SignInRoot>
  );
};
