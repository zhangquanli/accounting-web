import React, { useEffect, useState } from "react";
import ajax from "../../utils/ajax";
import { Button, Form, Input, message, Modal, Space, Table } from "antd";
import styles from "./index.module.scss";
import { PermissionColumn, Role } from "../../constants/entity";
import { ColumnsType } from "antd/es/table";
import PageTree from "./components/PageTree";
import { ModalInfo, OptionType } from "../../constants/type";
import ParentTreeSelect from "../../components/ParentTreeSelect";
import PermissionColumnTreeSelect from "./components/PermissionColumnTreeSelect";

interface Props {}

const RoleManager: React.FC<Props> = () => {
  const [roleForm] = Form.useForm<any>();
  const roleId = Form.useWatch("id", roleForm);
  const rolePermission = Form.useWatch("permissionColumn", roleForm);

  const [tableDataSource, setTableDataSource] = useState<Role[]>([]);
  const [tableLoading, setTableLoading] = useState<boolean>(true);
  const [roleModal, setRoleModal] = useState<ModalInfo>({
    title: "",
    visible: false,
  });
  const [treeData, setTreeData] = useState<OptionType[]>([]);
  const [permissionFilter, setPermissionFilter] = useState<PermissionColumn>();

  useEffect(() => {
    if (tableLoading) {
      (async () => {
        try {
          const data: Role[] = await ajax.get("/roles/selectTree");
          const filter = (roles: Role[]) => {
            return roles.map((item) => {
              const { children } = item;
              if (children && children.length > 0) {
                item.children = filter(children);
              } else {
                item.children = undefined;
              }
              return item;
            });
          };
          setTableDataSource(filter(data));
          setTableLoading(false);
        } catch (e) {
          setTableDataSource([]);
          setTableLoading(false);
        }
      })();
    }
  }, [tableLoading]);

  useEffect(() => {
    setTreeData(roles2Options(tableDataSource));
  }, [tableDataSource]);

  const openUpdateModal = (role: Role) => {
    console.log('role',role)
    const { id, name, code, parent, permissionColumn } = role;
    const { roleRelPageInfos } = role;
    const { roleRelComponentInfos } = role;
    const { roleRelDisplayColumns } = role;
    roleForm.resetFields();
    roleForm.setFieldsValue({
      id,
      name,
      code,
      permissionColumn,
      parent,
      treeInfos: {
        roleRelPageInfos,
        roleRelComponentInfos,
        roleRelDisplayColumns,
      },
    });
    setPermissionFilter(undefined);
    setRoleModal({ title: "修改角色", visible: true });
  };

  const columns: ColumnsType<Role> = [
    {
      title: "角色名称",
      key: "name",
      dataIndex: "name",
    },
    {
      title: "角色代码",
      key: "code",
      dataIndex: "code",
    },
    {
      title: "权限等级",
      key: "permissionColumn",
      dataIndex: "permissionColumn",
      render: (value) => value.name,
    },
    {
      title: "操作",
      key: "operation",
      dataIndex: "operation",
      render: (value, record) => {
        return (
          <Space>
            <Button type="primary" onClick={() => openUpdateModal(record)}>
              编辑
            </Button>
            <Button
              type="primary"
              onClick={() => {
                roleForm.resetFields();
                roleForm.setFieldsValue({ parent: { id: record.id } });
                setPermissionFilter(record.permissionColumn);
                setRoleModal({ title: "新增角色", visible: true });
              }}
            >
              新增下级
            </Button>
          </Space>
        );
      },
    },
  ];

  const save = async (values: any) => {
    if (values.id) {
      await updateRole(values);
    } else {
      await insertRole(values);
    }
  };

  const insertRole = async (values: any) => {
    const { name, code, permissionColumn, parent, treeInfos } = values;
    const role: Role = { name, code, permissionColumn, parent, ...treeInfos };
    try {
      await ajax.post("/roles", role);
      message.destroy();
      message.success("新增成功");
      setTableLoading(true);
      setRoleModal({ title: "", visible: false });
    } catch (e) {
      message.destroy();
      message.error("新增失败");
    }
  };

  const updateRole = async (values: any) => {
    const { id, name, code, permissionColumn, parent, treeInfos } = values;
    const role: Role = { name, code, permissionColumn, parent, ...treeInfos };
    try {
      await ajax.put(`/roles/${id}`, role);
      message.destroy();
      message.success("修改成功");
      setTableLoading(true);
      setRoleModal({ title: "", visible: false });
    } catch (e) {
      message.destroy();
      message.error("修改失败");
    }
  };

  return (
    <div className={styles.container}>
      <Space className={styles.query}>
        <Button type="primary" onClick={() => setTableLoading(true)}>
          查询
        </Button>
        <Button
          type="primary"
          onClick={() => {
            roleForm.resetFields();
            setPermissionFilter(undefined);
            setRoleModal({ title: "新增角色", visible: true });
          }}
        >
          新增
        </Button>
      </Space>
      <Table
        rowKey="id"
        scroll={{ y: 500 }}
        pagination={false}
        dataSource={tableDataSource}
        columns={columns}
        loading={tableLoading}
      />
      <Modal
        title={roleModal.title}
        visible={roleModal.visible}
        width={800}
        footer={null}
        onCancel={() => setRoleModal({ title: "", visible: false })}
      >
        <Form
          labelCol={{ span: 6 }}
          wrapperCol={{ span: 16 }}
          form={roleForm}
          onFinish={save}
        >
          <Form.Item name="id" hidden={true}>
            <Input />
          </Form.Item>
          <Form.Item name="parent" label="父级角色">
            <ParentTreeSelect
              treeData={treeData}
              placeholder="请输入父级角色"
            />
          </Form.Item>
          <Form.Item
            name="name"
            label="名称"
            rules={[{ required: true, message: "请输入角色名称" }]}
          >
            <Input placeholder="请输入角色名称" />
          </Form.Item>
          <Form.Item
            name="code"
            label="代码"
            rules={[{ required: true, message: "请输入角色代码" }]}
          >
            <Input placeholder="请输入角色代码" />
          </Form.Item>
          <Form.Item
            name="permissionColumn"
            label="权限字段"
            rules={[{ required: true, message: "请输入权限字段" }]}
          >
            <PermissionColumnTreeSelect
              placeholder="请输入权限字段"
              filter={permissionFilter}
              disabled={roleId !== undefined}
            />
          </Form.Item>
          <Form.Item name="treeInfos" label="关联页面">
            <PageTree filter={rolePermission} />
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

const roles2Options = (roles: Role[]) => {
  return roles.map((item) => {
    const option: OptionType = { value: item.id, label: item.name };
    const { children } = item;
    if (children && children.length > 0) {
      option.children = roles2Options(children);
    }
    return option;
  });
};

export default RoleManager;
