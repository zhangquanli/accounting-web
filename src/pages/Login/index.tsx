import React from 'react';
import { Button, Form, Input, message } from "antd";
import { LockOutlined, UserOutlined } from "@ant-design/icons";
import styles from './index.module.scss'
import { useNavigate } from "react-router-dom";
import { token } from "../../services/oauth2API";

const Login = () => {
  const navigate = useNavigate();

  const onFinish = async (values: any) => {
    const { username, password } = values;
    token(username, password).then(() => {
      message.destroy();
      message.success('登录成功');
      navigate('/');
    }).catch((error) => {
      if (error.response.status === 400) {
        message.destroy();
        message.error('账号或密码错误');
      } else {
        message.destroy();
        message.error('网络异常，请稍后重试');
      }
    });
  };

  return (
    <div className={styles.container}>
      <Form
        name="basic"
        onFinish={onFinish}
        className={styles.loginForm}
      >
        <Form.Item>
          <div style={{ fontSize: '20px' }}>简易财会管理系统</div>
        </Form.Item>
        <Form.Item
          name="username"
          rules={[{ required: true, message: '请输入账号' }]}
        >
          <Input prefix={<UserOutlined className="site-form-item-icon" />} placeholder="账号" />
        </Form.Item>
        <Form.Item
          name="password"
          rules={[{ required: true, message: '请输入密码' }]}
        >
          <Input
            prefix={<LockOutlined className="site-form-item-icon" />}
            type="password"
            placeholder="密码"
          />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" style={{ width: '100%' }}>登录</Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default Login;