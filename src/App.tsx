import React, { useEffect } from 'react';
import './App.css';
import { Layout, Menu } from "antd";
import { UploadOutlined, UserOutlined, VideoCameraOutlined } from "@ant-design/icons";
import { reloadSubjects } from "./redux/subjectSlice";
import { useAppDispatch } from "./app/hooks";
import AccountManager from "./pages/AccountManager";

const { Content, Sider } = Layout;

const App = () => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(reloadSubjects());
  }, []);

  return (
    <Layout>
      <Sider
        breakpoint="lg"
        collapsedWidth="0"
        onBreakpoint={broken => {
          console.log(broken);
        }}
        onCollapse={(collapsed, type) => {
          console.log(collapsed, type);
        }}
      >
        <Menu theme="dark" mode="inline" defaultSelectedKeys={['1']}>
          <Menu.Item key="1" icon={<UserOutlined />}>新增凭证</Menu.Item>
          <Menu.Item key="2" icon={<VideoCameraOutlined />}>查询凭证</Menu.Item>
          <Menu.Item key="3" icon={<UploadOutlined />}>测试菜单</Menu.Item>
          <Menu.Item key="4" icon={<UserOutlined />}>测试菜单</Menu.Item>
        </Menu>
      </Sider>
      <Layout>
        <Content style={{ margin: '2.4rem 1.6rem' }}>
          <div style={{ padding: '2.4rem', minHeight: '70rem', backgroundColor: '#ffffff' }}>
            <AccountManager />
          </div>
        </Content>
      </Layout>
    </Layout>
  );
}

export default App;
