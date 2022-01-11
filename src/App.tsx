import React, { useEffect } from 'react';
import './App.css';
import { Layout, Menu } from "antd";
import { AccountBookOutlined, GroupOutlined, ScheduleOutlined } from "@ant-design/icons";
import { reloadSubjectBalances } from "./redux/subjectBalanceSlice";
import { useAppDispatch } from "./app/hooks";
import { BrowserRouter, Link, Route, Routes } from "react-router-dom";
import VoucherManager from "./pages/VoucherManager";
import AccountManager from "./pages/AccountManager";
import SubjectManager from "./pages/SubjectManager";

const { Content, Sider } = Layout;

const App = () => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(reloadSubjectBalances());
  }, [dispatch]);

  return (
    <BrowserRouter>
      <Layout>
        <Sider className="sider">
          <div className="logo" />
          <Menu theme="dark" mode="inline" defaultSelectedKeys={['voucherManager']}>
            <Menu.Item key="voucherManager" icon={<ScheduleOutlined />}>
              <Link to="voucherManager">凭证管理</Link>
            </Menu.Item>
            <Menu.Item key="accountManager" icon={<AccountBookOutlined />}>
              <Link to="accountManager">账簿管理</Link>
            </Menu.Item>
            <Menu.Item key="subjectManager" icon={<GroupOutlined />}>
              <Link to="subjectManager">科目管理</Link>
            </Menu.Item>
          </Menu>
        </Sider>
        <Layout style={{ marginLeft: '200px' }}>
          <Content className="content">
            <Routes>
              <Route path="voucherManager" element={<VoucherManager />} />
              <Route path="accountManager" element={<AccountManager />} />
              <Route path="subjectManager" element={<SubjectManager />} />
              <Route index={true} element={<VoucherManager />} />
            </Routes>
          </Content>
        </Layout>
      </Layout>
    </BrowserRouter>
  );
}

export default App;
