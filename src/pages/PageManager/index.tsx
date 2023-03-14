import React, { useEffect, useState } from "react";
import {
  Button,
  Form,
  Input,
  message,
  Modal,
  Select,
  Space,
  Table,
} from "antd";
import styles from "./index.module.scss";
import { ColumnsType } from "antd/es/table";
import ajax from "../../utils/ajax";
import ApiTransfer from "./components/ApiTransfer";
import { PageInfo } from "../../constants/entity";
import ComponentInput from "./components/ComponentInput";
import { ModalInfo, OptionType } from "../../constants/type";
import ParentTreeSelect from "../../components/ParentTreeSelect";

interface Props {}

const typeOptions = [
  { value: "REALITY", label: "真实" },
  { value: "VIRTUALITY", label: "虚拟" },
];

const PageManager: React.FC<Props> = () => {
  const [pageForm] = Form.useForm<PageInfo>();
  const pageType = Form.useWatch("type", pageForm);
  const pageId = Form.useWatch("id", pageForm);

  const [tableDataSource, setTableDataSource] = useState<PageInfo[]>([]);
  const [tableLoading, setTableLoading] = useState<boolean>(true);
  const [pageModal, setPageModal] = useState<ModalInfo>({
    title: "",
    visible: false,
  });
  const [treeData, setTreeData] = useState<OptionType[]>([]);

  // 加载页面表格
  useEffect(() => {
    if (tableLoading) {
      (async () => {
        try {
          const data: PageInfo[] = await ajax.get("/pageInfos");
          const filter = (pages: PageInfo[]) => {
            return pages.map((item) => {
              if (item.children && item.children.length > 0) {
                item.children = filter(item.children);
              } else {
                item.children = undefined;
              }
              return item;
            });
          };
          setTableDataSource(filter(data));
          setTableLoading(false);
        } catch (e) {
          console.log("接口调用失败", e);
          setTableDataSource([]);
          setTableLoading(false);
        }
      })();
    }
  }, [tableLoading]);

  // 父级页面选择数据
  useEffect(() => {
    const filter = (pageInfos: PageInfo[]) => {
      return pageInfos
        .filter((item) => item.type === "VIRTUALITY")
        .map((item) => {
          const option: OptionType = { value: item.id, label: item.name };
          if (item.children && item.children.length > 0) {
            option.children = filter(item.children);
          }
          return option;
        });
    };
    setTreeData(filter(tableDataSource));
  }, [tableDataSource]);

  const columns: ColumnsType<PageInfo> = [
    {
      title: "页面名称",
      key: "name",
      dataIndex: "name",
    },
    {
      title: "页面代码",
      key: "code",
      dataIndex: "code",
    },
    {
      title: "页面类型",
      key: "type",
      dataIndex: "type",
      render: (value) => {
        const type = typeOptions.find((item) => item.value === value);
        return type && type.label;
      },
    },
    {
      title: "页面地址",
      key: "url",
      dataIndex: "url",
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
                pageForm.setFieldsValue({ ...record });
                setPageModal({ title: "修改页面", visible: true });
              }}
            >
              编辑
            </Button>
            {record.type === "VIRTUALITY" && (
              <Button
                type="primary"
                onClick={() => {
                  pageForm.resetFields();
                  pageForm.setFieldsValue({ parent: { id: record.id } });
                  setPageModal({ title: "新增页面", visible: true });
                }}
              >
                新增下级页面
              </Button>
            )}
          </Space>
        );
      },
    },
  ];

  const save = async (pageInfo: PageInfo) => {
    if (pageInfo.id) {
      await updatePage(pageInfo);
    } else {
      await insertPage(pageInfo);
    }
  };

  const insertPage = async (pageInfo: PageInfo) => {
    try {
      await ajax.post("/pageInfos", pageInfo);
      message.destroy();
      message.success("新增成功").then(undefined);
      setPageModal({ title: "", visible: false });
      setTableLoading(true);
    } catch (e) {
      message.destroy();
      message.error("新增失败").then(undefined);
    }
  };

  const updatePage = async (pageInfo: PageInfo) => {
    try {
      await ajax.put(`/pageInfos/${pageInfo.id}`, pageInfo);
      message.destroy();
      message.success("修改成功");
      setPageModal({ title: "", visible: false });
      setTableLoading(true);
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
            pageForm.resetFields();
            setPageModal({ title: "新增页面", visible: true });
          }}
        >
          新增根页面
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
      {/*保存页面信息的弹窗*/}
      <Modal
        title={pageModal.title}
        visible={pageModal.visible}
        width={800}
        footer={null}
        onCancel={() => setPageModal({ title: "", visible: false })}
      >
        <Form
          labelCol={{ span: 6 }}
          wrapperCol={{ span: 16 }}
          form={pageForm}
          onFinish={save}
        >
          <Form.Item name="id" hidden={true}>
            <Input />
          </Form.Item>
          <Form.Item name="parent" label="父级页面">
            <ParentTreeSelect
              treeData={treeData}
              placeholder="请选择父级页面"
            />
          </Form.Item>
          <Form.Item
            name="name"
            label="页面名称"
            rules={[{ required: true, message: "请输入页面名称" }]}
          >
            <Input placeholder="请输入页面名称" />
          </Form.Item>
          <Form.Item
            name="code"
            label="页面代码"
            rules={[{ required: true, message: "请输入页面代码" }]}
          >
            <Input placeholder="请输入页面代码" />
          </Form.Item>
          <Form.Item
            name="url"
            label="页面地址"
            rules={[{ required: true, message: "请输入页面地址" }]}
          >
            <Input placeholder="请输入页面地址" />
          </Form.Item>
          <Form.Item
            name="type"
            label="页面类型"
            rules={[{ required: true, message: "请选择页面类型" }]}
          >
            <Select
              placeholder="请选择页面类型"
              options={typeOptions}
              disabled={pageId !== undefined}
            />
          </Form.Item>
          <Form.Item
            name="apiInfos"
            label="关联接口"
            hidden={pageType !== "REALITY"}
          >
            <ApiTransfer />
          </Form.Item>
          <Form.Item
            name="componentInfos"
            label="关联组件"
            hidden={pageType !== "REALITY"}
          >
            <ComponentInput />
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

export default PageManager;
