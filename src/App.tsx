import React, { useEffect, useState } from 'react';
import styles from './App.module.scss'
import { Breadcrumb, Button, Layout, Menu, Select } from "antd";
import { AccountBookOutlined, BankTwoTone, GroupOutlined, ScheduleOutlined } from "@ant-design/icons";
import { Link, Route, Routes, useLocation } from "react-router-dom";
import VoucherManager from "./pages/VoucherManager";
import AccountManager from "./pages/AccountManager";
import SubjectManager from "./pages/SubjectManager";
import { selectAccounts } from "./services/accountAPI";
import { useAppDispatch, useAppSelector } from "./app/hooks";
import { updateActiveAccountId } from "./redux/userInfoSlice";

const { Header, Content, Sider } = Layout;

const menus = [
  {
    name: '凭证管理',
    url: '/voucherManager',
    icon: <ScheduleOutlined />,
  },
  {
    name: '账簿管理',
    url: '/accountManager',
    icon: <AccountBookOutlined />,
  },
  {
    name: '科目管理',
    url: '/subjectManager',
    icon: <GroupOutlined />,
  },
];

const App = () => {

  // 账簿数据
  const [accounts, setAccounts] = useState<any[]>([]);
  useEffect(() => {
    (async () => {
      const data = await selectAccounts({});
      setAccounts(data);
    })();
  }, []);

  // 激活的账簿
  const activeAccountId = useAppSelector(state => state.userInfo.activeAccountId);
  const dispatch = useAppDispatch();
  useEffect(() => {
    // TODO 获取用户选择的默认账簿
    dispatch(updateActiveAccountId(accounts[accounts.length - 1]?.id));
  }, [accounts]);

  // 根据路由，设置选中菜单
  const location = useLocation();
  const selectedKey = location.pathname === '/' ? '/voucherManager' : location.pathname;

  return (
    <Layout>
      <Header className={styles.header}>
        <div style={{ width: '50%' }}>
          <BankTwoTone style={{ fontSize: '20px', marginRight: '8px' }} />
          <span style={{ fontSize: '18px', color: '#fff' }}>简易财会管理系统</span>
        </div>
        <div style={{ width: '50%', display: "flex", justifyContent: "flex-end" }}>
          <div>
            <Select
              style={{ width: '120px' }}
              value={activeAccountId}
              onChange={(value) => {
                dispatch(updateActiveAccountId(value));
              }}
            >
              {(accounts || []).map(account =>
                (<Select.Option key={account.id} value={account.id}>{account.name}</Select.Option>))
              }
            </Select>
            <Button type="link">张三</Button>
          </div>
        </div>
      </Header>
      <Sider className={styles.sider}>
        <Menu mode="inline" style={{ borderRight: "none" }} selectedKeys={[selectedKey]}>
          {menus.map(item => {
            const { name, url, icon } = item;
            return (
              <Menu.Item key={url} icon={icon}>
                <Link to={url}>{name}</Link>
              </Menu.Item>
            );
          })}
        </Menu>
      </Sider>
      <Breadcrumb className={styles.breadcrumb}>
        <Breadcrumb.Item>Home</Breadcrumb.Item>
        <Breadcrumb.Item>List</Breadcrumb.Item>
        <Breadcrumb.Item>App</Breadcrumb.Item>
      </Breadcrumb>
      <Content className={styles.content}>
        <Routes>
          <Route path="/voucherManager" element={<VoucherManager />} />
          <Route path="/accountManager" element={<AccountManager />} />
          <Route path="/subjectManager" element={<SubjectManager />} />
          <Route index={true} element={<VoucherManager />} />
        </Routes>
      </Content>
    </Layout>
  );
}

export default App;
