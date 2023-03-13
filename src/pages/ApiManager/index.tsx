import React, { useEffect, useState } from "react";
import styles from "./index.module.scss";
import {
  Button,
  Form,
  Input,
  message,
  Modal,
  Select,
  Space,
  Table,
  TablePaginationConfig,
} from "antd";
import { useForm } from "antd/es/form/Form";
import { ColumnsType } from "antd/es/table";
import ajax from "../../utils/ajax";

interface QueryParams {
  name: string | null;
  code: string | null;
  page: number | null;
  size: number | null;
}

interface Api {
  id: number | null;
  name: string;
  url: string;
  httpMethod: string;
}

interface SaveModal {
  visible: boolean;
  title: string;
}

interface Props {}

const methods = [
  { label: "GET", value: "GET" },
  { label: "POST", value: "POST" },
  { label: "PUT", value: "PUT" },
  { label: "DELETE", value: "DELETE" },
];

const ApiManager: React.FC<Props> = () => {
  const [queryForm] = useForm<QueryParams>();
  const [saveForm] = useForm<Api>();

  const [columns] = useState<ColumnsType<Api>>([
    { title: "接口名称", dataIndex: "name", key: "name" },
    { title: "接口地址", dataIndex: "url", key: "url" },
    { title: "HTTP方法", dataIndex: "httpMethod", key: "httpMethod" },
    {
      title: "操作",
      dataIndex: "operation",
      key: "operation",
      render: (value, record) => {
        return (
          <Button
            type="primary"
            onClick={() => {
              saveForm.setFieldsValue({ ...record });
              setSaveModal({ visible: true, title: "修改接口" });
            }}
          >
            编辑
          </Button>
        );
      },
    },
  ]);
  const [queryParams, setQueryParams] = useState<QueryParams>({
    name: null,
    code: null,
    page: 1,
    size: 10,
  });
  const [pagination, setPagination] = useState<TablePaginationConfig>({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [dataSource, setDataSource] = useState<Api[]>([]);
  const [saveModal, setSaveModal] = useState<SaveModal>({
    visible: false,
    title: "",
  });

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const result: any = await ajax.get("/apiInfos", queryParams);
        const content: Api[] = result.content;
        setDataSource(content);
        const { totalElements } = result;
        if (totalElements !== pagination?.total) {
          setPagination({
            ...pagination,
            total: result.totalElements,
          });
        }
        setLoading(false);
      } catch (e) {
        console.log("查询【接口】失败", e);
        setDataSource([]);
        setLoading(false);
      }
    })();
  }, [queryParams]);

  const save = async (api: Api) => {
    if (api.id) {
      await updateApi(api);
    } else {
      await insertApi(api);
    }
    setSaveModal({ title: "", visible: false });
    setQueryParams({ ...queryParams });
  };

  const insertApi = async (api: Api) => {
    try {
      await ajax.post("/apiInfos", api);
      message.destroy();
      message.success("新增成功");
    } catch (e) {
      console.log("新增【接口】失败", e);
      message.destroy();
      message.error("新增失败");
    }
  };

  const updateApi = async (api: Api) => {
    try {
      await ajax.put(`/apiInfos/${api.id}`, api);
      message.destroy();
      message.success("修改成功");
    } catch (e) {
      console.log("修改【接口】失败", e);
      message.destroy();
      message.error("修改失败");
    }
  };

  const handleTableChange = (pagination: TablePaginationConfig) => {
    setPagination({ ...pagination });
    const { current, pageSize } = pagination;
    setQueryParams({
      ...queryParams,
      page: current || 1,
      size: pageSize || 10,
    });
  };

  return (
    <div className={styles.container}>
      <Form
        form={queryForm}
        onFinish={(values) => {
          setPagination({ ...pagination, current: 1 });
          setQueryParams({ ...queryParams, ...values, page: 1 });
        }}
      >
        <div className={styles.form}>
          <Form.Item name="name" label="名称" className={styles.formItem}>
            <Input />
          </Form.Item>
          <Form.Item name="code" label="代码" className={styles.formItem}>
            <Input />
          </Form.Item>
          <Form.Item className={styles.formItem}>
            <Button type="default" htmlType="reset">
              重置
            </Button>
          </Form.Item>
          <Form.Item className={styles.formItem}>
            <Button type="primary" htmlType="submit">
              查询
            </Button>
          </Form.Item>
          <Form.Item className={styles.formItem}>
            <Button
              type="primary"
              onClick={() => {
                saveForm.resetFields();
                setSaveModal({ visible: true, title: "新增接口" });
              }}
            >
              新增
            </Button>
          </Form.Item>
        </div>
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
      <Modal
        title={saveModal.title}
        visible={saveModal.visible}
        footer={null}
        onCancel={() => setSaveModal({ ...saveModal, visible: false })}
      >
        <Form
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 18 }}
          form={saveForm}
          onFinish={save}
        >
          <Form.Item name="id" hidden={true}>
            <Input />
          </Form.Item>
          <Form.Item
            name="name"
            label="接口名称"
            rules={[{ required: true, message: "请输入" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="url"
            label="接口地址"
            rules={[{ required: true, message: "请输入" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="httpMethod"
            label="HTTP方法"
            rules={[{ required: true, message: "请选择" }]}
          >
            <Select options={methods} />
          </Form.Item>
          <Form.Item wrapperCol={{ offset: 4, span: 18 }}>
            <Space>
              <Button type="primary" htmlType="submit">
                保存
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ApiManager;
