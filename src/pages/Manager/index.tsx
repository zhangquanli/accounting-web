import React, { useEffect, useState } from 'react';
import styles from "../../App.module.scss";
import { AccountBookOutlined, BankTwoTone, GroupOutlined, ScheduleOutlined } from "@ant-design/icons";
import { Breadcrumb, Button, Layout, Menu, Select } from "antd";
import { updateActiveAccountId } from "../../redux/userInfoSlice";
import { Link, Route, Routes, useLocation } from "react-router-dom";
import VoucherManager from "../VoucherManager";
import AccountingEntryManager from "../AccountingEntryManager";
import AccountManager from "../AccountManager";
import SubjectManager from "../SubjectManager";
import { selectAccounts } from "../../services/accountAPI";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { reloadSubjectTree } from "../../redux/subjectSlice";

const { Header, Content, Sider } = Layout;

const menus = [
  {
    name: '凭证管理',
    icon: <ScheduleOutlined />,
    url: '/voucherManager',
    component: <VoucherManager />,
  },
  {
    name: '会计分录管理',
    icon: <ScheduleOutlined />,
    url: '/accountingEntryManager',
    component: <AccountingEntryManager />,
  },
  {
    name: '账簿管理',
    icon: <AccountBookOutlined />,
    url: '/accountManager',
    component: <AccountManager />,
  },
  {
    name: '科目管理',
    icon: <GroupOutlined />,
    url: '/subjectManager',
    component: <SubjectManager />,
  },
];

const Manager = () => {
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
    dispatch(reloadSubjectTree());
  }, [accounts, dispatch]);

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
          {menus.map(menu => {
            const { url, component } = menu;
            return <Route key={url} path={url} element={component} />;
          })}
          <Route index={true} element={<VoucherManager />} />
        </Routes>
      </Content>
    </Layout>
  );
};

export default Manager;