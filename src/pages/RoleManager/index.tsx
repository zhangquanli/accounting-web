import React, { useEffect, useState } from "react";
import ajax from "../../utils/ajax";
import {
  Button,
  Form,
  Input,
  message,
  Modal,
  Space,
  Table,
  TreeSelect,
} from "antd";
import styles from "./index.module.scss";
import { ModalInfo, Role } from "../../constants/entity";
import { ColumnsType } from "antd/es/table";

interface Props {}

const RoleManager: React.FC<Props> = (props) => {
  const [roleForm] = Form.useForm<Role>();

  const [tableDataSource, setTableDataSource] = useState<Role[]>([]);
  const [tableLoading, setTableLoading] = useState<boolean>(true);
  const [roleModal, setRoleModal] = useState<ModalInfo>({
    title: "",
    visible: false,
  });

  // 加载角色表格
  useEffect(() => {
    if (tableLoading) {
      (async () => {
        try {
          const data: Role[] = await ajax.get("roles");
          const newData = data.map((item) => {
            if (item.children && item.children.length < 1) {
              item.children = undefined;
            }
            return item;
          });
          setTableDataSource(newData);
          setTableLoading(false);
        } catch (e) {
          console.log("调用接口失败", e);
          setTableDataSource([]);
          setTableLoading(false);
        }
      })();
    }
  }, [tableLoading]);

  useEffect(() => {
    (async () => {
      const data: any = await ajax.get("/pages");
      const menus = data[0].children;

      const column2tree = (columns: any[]) => {
        return columns.map((item: any) => {
          const { id, name } = item;
          return { title: `数据字段-${name}`, key: `column-${id}` };
        });
      };

      const component2tree = (components: any[]) => {
        return components.map((item: any) => {
          const { id, name, columns } = item;
          const children = column2tree(columns);
          return { title: `组件-${name}`, key: `component-${id}`, children };
        });
      };

      const page2tree: any = (pages: any[]) => {
        return pages.map((item: any) => {
          const { id, name, type, children, components } = item;
          if (type === "REALITY") {
            const newChildren = component2tree(components);
            return { title: name, key: `page-${id}`, children: newChildren };
          } else {
            const newChildren = page2tree(children);
            return { title: name, key: `page-${id}`, children: newChildren };
          }
        });
      };

      const trees = page2tree(menus);
      console.log("树状结构", trees);
      // setPages(trees);
    })();
  }, []);

  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);

  const submit = () => {
    console.log("selectedKeys", selectedKeys);
    const pages = selectedKeys
      .filter((item) => item.includes("page-"))
      .map((item) => {
        const id = item.replace("page-", "");
        return { id: parseInt(id) };
      });
    const components = selectedKeys
      .filter((item) => item.includes("component-"))
      .map((item) => {
        const id = item.replace("component-", "");
        return { id: parseInt(id) };
      });
    const columns = selectedKeys
      .filter((item) => item.includes("column-"))
      .map((item) => {
        const id = item.replace("column-", "");
        return { id: parseInt(id) };
      });

    const id = 1;
    const role = { name: "管理员", pages, components, columns };
    (async () => {
      try {
        await ajax.put(`/roles/${id}`, role);
        message.success("保存成功");
      } catch (e) {
        console.log("保存失败", e);
        message.error("保存失败");
      }
    })();
  };

  const columns: ColumnsType<Role> = [
    {
      title: "角色名称",
      key: "name",
      dataIndex: "name",
    },
    {
      title: "操作",
      key: "operation",
      dataIndex: "operation",
      render: (value, record) => {
        return (
          <Button
            type="primary"
            onClick={() => {
              roleForm.setFieldsValue({ ...record });
              setRoleModal({ title: "修改角色", visible: true });
            }}
          >
            编辑
          </Button>
        );
      },
    },
  ];

  const save = (role: Role) => {
    console.log("ceshi", role);
  };

  return (
    <div className={styles.container}>
      <Space className={styles.query}>
        <Button type="primary">查询</Button>
        <Button
          type="primary"
          onClick={() => setRoleModal({ title: "新增角色", visible: true })}
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
          <Form.Item name="name" label="名称">
            <Input />
          </Form.Item>
          <Form.Item name="treeInfos" label="关联页面">
            <TreeSelect />
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
