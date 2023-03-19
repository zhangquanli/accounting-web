import React, { useEffect, useState } from "react";
import styles from "./index.module.scss";
import {
  Button,
  Form,
  Input,
  message,
  Modal,
  Space,
  Table,
  TablePaginationConfig,
  Tag,
} from "antd";
import { PageResult, User, UserRelRole } from "../../constants/entity";
import { ModalInfo } from "../../constants/type";
import UserRelRolesForm from "./components/UserRelRolesForm";
import ajax from "../../utils/ajax";
import { ColumnsType } from "antd/es/table";

interface QueryParams {
  name?: string;
  page: number;
  size: number;
}

interface Props {}

const UserManager: React.FC<Props> = () => {
  const [queryForm] = Form.useForm<any>();
  const [userForm] = Form.useForm<User>();

  const [columns] = useState<ColumnsType<User>>([
    { title: "账号", dataIndex: "username", key: "username" },
    { title: "密码", dataIndex: "password", key: "password" },
    {
      title: "已授权角色",
      dataIndex: "userRelRoles",
      key: "userRelRoles",
      render: (value) => {
        return value.map((item: UserRelRole) => (
          <Tag
            key={item.id}
            className={styles.tag}
            color="orange"
          >{`${item.role?.name}-${item.label}`}</Tag>
        ));
      },
    },
    {
      title: "操作",
      dataIndex: "operation",
      key: "operation",
      render: (value, record) => (
        <Button
          type="primary"
          onClick={() => {
            userForm.setFieldsValue({ ...record });
            setUserModal({ visible: true, title: "修改用户" });
          }}
        >
          编辑
        </Button>
      ),
    },
  ]);
  const [queryParams, setQueryParams] = useState<QueryParams>({
    name: undefined,
    page: 1,
    size: 10,
  });
  const [pagination, setPagination] = useState<TablePaginationConfig>({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [dataSource, setDataSource] = useState<User[]>([]);
  const [userModal, setUserModal] = useState<ModalInfo>({
    title: "",
    visible: false,
  });

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const result: PageResult<User> = await ajax.get(
          "/users/selectPage",
          queryParams
        );
        setDataSource(result.content);
        const { totalElements } = result;
        if (totalElements !== pagination.total) {
          setPagination({ ...pagination, total: totalElements });
        }
      } catch (e) {
        setDataSource([]);
      } finally {
        setLoading(false);
      }
    })();
  }, [queryParams]);

  const handleTableChange = (pagination: TablePaginationConfig) => {
    setPagination({ ...pagination });
    const { current, pageSize } = pagination;
    setQueryParams({
      ...queryParams,
      page: current || 1,
      size: pageSize || 10,
    });
  };

  const save = async (user: User) => {
    if (user.id) {
      await updateUser(user);
    } else {
      await insertUser(user);
    }
  };

  const insertUser = async (user: User) => {
    try {
      await ajax.post("/users", user);
      message.destroy();
      message.success("新增成功");
      setQueryParams({ ...queryParams });
      setUserModal({ title: "", visible: false });
    } catch (e) {
      message.destroy();
      message.error("新增失败");
    }
  };

  const updateUser = async (user: User) => {
    try {
      await ajax.put(`/users/${user.id}`, user);
      message.destroy();
      message.success("修改成功");
      setQueryParams({ ...queryParams });
      setUserModal({ title: "", visible: false });
    } catch (e) {
      message.destroy();
      message.error("修改失败");
    }
  };

  return (
    <div className={styles.container}>
      <Space direction="vertical" size="middle">
        <Form
          form={queryForm}
          layout="inline"
          onFinish={(values) => {
            setQueryParams({ ...queryParams, ...values });
          }}
        >
          <Form.Item name="username" label="账号">
            <Input />
          </Form.Item>
          <Form.Item>
            <Button type="ghost" htmlType="reset">
              重置
            </Button>
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">
              查询
            </Button>
          </Form.Item>
          <Form.Item>
            <Button
              type="primary"
              onClick={() => {
                userForm.resetFields();
                setUserModal({ title: "新增用户", visible: true });
              }}
            >
              新增
            </Button>
          </Form.Item>
        </Form>
        <Table
          rowKey="id"
          columns={columns}
          dataSource={dataSource}
          pagination={pagination}
          loading={loading}
          onChange={handleTableChange}
          scroll={{ y: 500 }}
        />
      </Space>
      <Modal
        title={userModal.title}
        visible={userModal.visible}
        footer={null}
        onCancel={() => setUserModal({ title: "", visible: false })}
      >
        <Form
          labelCol={{ span: 6 }}
          wrapperCol={{ span: 16 }}
          form={userForm}
          onFinish={save}
        >
          <Form.Item name="id" hidden={true}>
            <Input />
          </Form.Item>
          <Form.Item
            name="username"
            label="账号"
            rules={[{ required: true, message: "请输入账号" }]}
          >
            <Input placeholder="请输入账号" />
          </Form.Item>
          <Form.Item
            name="password"
            label="密码"
            rules={[{ required: true, message: "请输入密码" }]}
          >
            <Input.Password placeholder="请输入密码" />
          </Form.Item>
          <Form.Item
            name="userRelRoles"
            label="关联角色"
            rules={[{ required: true, message: "请勾选角色" }]}
          >
            <UserRelRolesForm />
          </Form.Item>
          <Form.Item wrapperCol={{ offset: 6, span: 16 }}>
            <Button type="primary" htmlType="submit">
              保存
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default UserManager;
