import React, { useEffect, useState } from "react";
import ajax from "../../utils/ajax";
import { Button, Form, Input, message, Modal, Space, Table } from "antd";
import styles from "./index.module.scss";
import { Role } from "../../constants/entity";
import { ColumnsType } from "antd/es/table";
import PageTree from "./components/PageTree";
import { ModalInfo, OptionType } from "../../constants/type";
import ParentTreeSelect from "../../components/ParentTreeSelect";

interface Props {}

const RoleManager: React.FC<Props> = () => {
  const [roleForm] = Form.useForm<any>();

  const [tableDataSource, setTableDataSource] = useState<Role[]>([]);
  const [tableLoading, setTableLoading] = useState<boolean>(true);
  const [roleModal, setRoleModal] = useState<ModalInfo>({
    title: "",
    visible: false,
  });
  const [treeData, setTreeData] = useState<OptionType[]>([]);

  // 加载角色表格
  useEffect(() => {
    if (tableLoading) {
      (async () => {
        try {
          const data: Role[] = await ajax.get("/roles");
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
          console.log("调用接口失败", e);
          setTableDataSource([]);
          setTableLoading(false);
        }
      })();
    }
  }, [tableLoading]);

  // 父级角色数据
  useEffect(() => {
    const filter = (roles: Role[]) => {
      return roles.map((item) => {
        const option: OptionType = { value: item.id, label: item.name };
        const { children } = item;
        if (children && children.length > 0) {
          option.children = filter(children);
        }
        return option;
      });
    };
    setTreeData(filter(tableDataSource));
  }, [tableDataSource]);

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
      title: "操作",
      key: "operation",
      dataIndex: "operation",
      render: (value, record) => {
        return (
          <Space>
            <Button
              type="primary"
              onClick={() => {
                const { id, name, code, parent } = record;
                const { pageInfos, componentInfos, displayColumns } = record;
                const treeInfos = { pageInfos, componentInfos, displayColumns };
                roleForm.setFieldsValue({ id, name, code, parent, treeInfos });
                setRoleModal({ title: "修改角色", visible: true });
              }}
            >
              编辑
            </Button>
            <Button
              type="primary"
              onClick={() => {
                roleForm.resetFields();
                roleForm.setFieldsValue({ parent: { id: record.id } });
                setRoleModal({ title: "新增角色", visible: true });
              }}
            >
              新增下一级角色
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
    const { name, code, parent, treeInfos } = values;
    const role: Role = { name, code, parent, ...treeInfos };
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
    const { id, name, code, parent, treeInfos } = values;
    const role: Role = { name, code, parent, ...treeInfos };
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
          <Form.Item name="treeInfos" label="关联页面">
            <PageTree />
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

export default RoleManager;
