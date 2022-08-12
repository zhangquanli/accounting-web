import React, { useEffect, useState } from 'react';
import { AccountBookOutlined, BankTwoTone, GroupOutlined, ScheduleOutlined, SettingOutlined } from "@ant-design/icons";
import { Breadcrumb, Button, Layout, Menu, Select } from "antd";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { updateActiveAccountId } from "../../redux/userInfoSlice";
import { reloadSubjectTree } from "../../redux/subjectSlice";
import { selectAccounts } from "../../services/accountAPI";
import styles from "./index.module.scss";

const { Header, Content, Sider } = Layout;

const menus = [
  {
    key: 'voucherManager',
    label: '凭证管理',
    icon: <ScheduleOutlined />,
  },
  {
    key: 'accountingEntryManager',
    label: '会计分录管理',
    icon: <ScheduleOutlined />,
  },
  {
    key: 'system',
    label: '系统管理',
    icon: <SettingOutlined />,
    children: [
      {
        key: 'accountManager',
        label: '账簿管理',
        icon: <AccountBookOutlined />,
      },
      {
        key: 'subjectManager',
        label: '科目管理',
        icon: <GroupOutlined />,
      },
    ],
  },
];

const Manager = () => {
  const location = useLocation();
  const navigate = useNavigate();

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

  const selectedKey = () => {
    const { pathname } = location;
    if (pathname === '/') {
      return 'voucherManager';
    }
    return pathname.substring(pathname.lastIndexOf('/') + 1, pathname.length);
  };

  return (
    <Layout className={styles.container}>
      <Header className={styles.header}>
        <div>
          <BankTwoTone style={{ fontSize: '20px', marginRight: '8px' }} />
          <span style={{ fontSize: '18px', color: '#fff' }}>简易财会管理系统</span>
        </div>
        <div>
          <Select
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
      </Header>
      <Layout>
        <Sider className={styles.sider}>
          <Menu
            mode="inline"
            style={{ borderRight: "none" }}
            items={menus}
            selectedKeys={[selectedKey()]}
            onClick={(e) => {
              const { keyPath } = e;
              const to = keyPath.reverse().reduce((previous, current) => {
                return `${previous}/${current}`;
              }, '');
              navigate(to);
            }}
          />
        </Sider>
        <Layout style={{ padding: '0 24px 24px 24px' }}>
          <Breadcrumb style={{ margin: '16px 0' }}>
            {location.pathname.split('/').map((key) => {
              return <Breadcrumb.Item key={key}>{key}</Breadcrumb.Item>;
            })}
          </Breadcrumb>
          <Content className={styles.content}>
            <Outlet />
          </Content>
        </Layout>
      </Layout>
    </Layout>
  );
};

export default Manager;