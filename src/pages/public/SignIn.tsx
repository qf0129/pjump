import { Button, Card, Flex, Form, Input } from 'antd';
import { type FormProps } from 'antd/es/form/Form';
import { Apis, type ReqSignIn } from '@/apis/apis';
import { useNavigate } from 'react-router';
import useApp from 'antd/es/app/useApp';
import styled from 'styled-components';

const SignInRoot = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background: #f0f2f5;
`;

export default function SignIn() {
  const app = useApp();
  const nav = useNavigate();
  const onFinish: FormProps<ReqSignIn>['onFinish'] = (values) => {
    Apis.SignIn(values).then((res) => {
      if (res.Code === 0) {
        app.message.success('登录成功');
        nav('/');
      } else {
        app.message.warning(res.Msg);
      }
    });
  };

  return (
    <SignInRoot>
      <Card title="PJUMP" style={{ width: 500 }} hoverable>
        <Form onFinish={onFinish} size="large" labelCol={{ span: 4 }}>
          <Form.Item<ReqSignIn> label="账号" name="Username" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item<ReqSignIn> label="密码" name="Password" rules={[{ required: true }]}>
            <Input.Password />
          </Form.Item>
          <Flex justify="right">
            <Button type="primary" size="large" htmlType="submit">
              SignIn
            </Button>
          </Flex>
        </Form>
      </Card>
    </SignInRoot>
  );
}
