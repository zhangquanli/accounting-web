import React, { useEffect, useState } from 'react';
import { Button, Col, Form, Input, Modal, Row, Select, Space, Table } from "antd";
import { useAppDispatch } from "../../app/hooks";
import { ColumnsType } from "antd/es/table";
import { useForm } from "antd/es/form/Form";
import { reloadSubjectBalances } from "../../redux/subjectBalanceSlice";
import styles from './index.module.scss';
import { insertSubject, selectSubjects, updateSubject } from "../../services/subjectAPI";

const fillTree = (subjects: any[]) => {
  const subjectGroups: any = {};
  for (let subject of subjects) {
    if (Object.keys(subjectGroups).includes(subject.parentNum)) {
      subjectGroups[subject.parentNum].push(subject);
    } else {
      subjectGroups[subject.parentNum] = [subject];
    }
  }
  const fillTree: any = (parentNum: string, subjectGroups: any) => {
    const result: any[] = subjectGroups[parentNum];
    if (!result || result.length < 1) return undefined;
    return result.map(item => {
      const children = fillTree(item.num, subjectGroups);
      return { ...item, children };
    });
  }
  return fillTree('0', subjectGroups);
}

const SubjectManager = () => {
  const dispatch = useAppDispatch();

  const [categoryOptions] = useState<any[]>([
    { value: 'ASSETS', label: '资产类' },
    { value: 'LIABILITY', label: '负债类' },
    { value: 'OWNERS_EQUITY', label: '所有者权益' },
    { value: 'COST', label: '成本类' },
    { value: 'PROFIT_AND_LOSS', label: '损益类' },
  ]);

  const [subjectOptions, setSubjectOptions] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      const subjects = await selectSubjects();
      const options = fillTree(subjects);
      setSubjectOptions(options);
    })();
  }, []);

  const columns: ColumnsType<any> = [
    {
      title: '名称',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '代码',
      dataIndex: 'code',
      key: 'code',
    },
    {
      title: '分类',
      dataIndex: 'category',
      key: 'category',
      render: value => {
        const option = categoryOptions.find(item => item.value === value);
        return option && option.label;
      },
    },
    {
      title: '操作',
      dataIndex: 'operation',
      key: 'operation',
      render: (value, record) => {
        return (
          <Space>
            <Button
              type="primary"
              onClick={() => {
                saveForm.resetFields();
                saveForm.setFieldsValue({ ...record });
                setVisible(true);
              }}
            >
              编辑
            </Button>
            <Button
              type="primary"
              onClick={() => {
                saveForm.resetFields();
                saveForm.setFieldsValue({ parentNum: record.num });
                setVisible(true);
              }}
            >
              新增下级
            </Button>
          </Space>
        );
      },
    },
  ];

  const [queryForm] = useForm();

  const [saveForm] = useForm();

  const [visible, setVisible] = useState<boolean>(false);

  return (
    <div className={styles.container}>
      <Form form={queryForm} onFinish={() => {
        dispatch(reloadSubjectBalances());
      }}>
        <Row gutter={16}>
          <Col span={4}>
            <Form.Item name="name" label="名称">
              <Input />
            </Form.Item>
          </Col>
          <Col span={4}>
            <Form.Item name="code" label="代码">
              <Input />
            </Form.Item>
          </Col>
          <Col span={4}>
            <Form.Item name="category" label="分类">
              <Select options={categoryOptions} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item>
              <Space>
                <Button type="default" htmlType="reset">重置</Button>
                <Button type="primary" htmlType="submit">查询</Button>
                <Button
                  type="primary"
                  onClick={() => {
                    saveForm.resetFields();
                    saveForm.setFieldsValue({ parentNum: '0' });
                    setVisible(true);
                  }}
                >
                  新增根目录
                </Button>
              </Space>
            </Form.Item>
          </Col>
        </Row>
      </Form>
      <Table
        pagination={false}
        rowKey="id"
        columns={columns}
        dataSource={subjectOptions}
      />
      <Modal
        title="会计科目"
        visible={visible}
        footer={null}
        onCancel={() => setVisible(false)}
      >
        <Form
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 18 }}
          form={saveForm}
          onFinish={async (values) => {
            const { id } = values;
            if (id) {
              await updateSubject(id, values);
            } else {
              await insertSubject(values);
            }
            setVisible(false);
            dispatch(reloadSubjectBalances());
          }}
        >
          <Form.Item
            name="name"
            label="名称"
            rules={[
              { required: true, message: '请输入名称' }
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="code"
            label="代码"
            rules={[
              { required: true, message: '请输入代码' }
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="category"
            label="分类"
            rules={[
              { required: true, message: '请选择分类' }
            ]}
          >
            <Select options={categoryOptions} />
          </Form.Item>
          <Form.Item name="id" hidden={true}>
            <Input />
          </Form.Item>
          <Form.Item name="num" hidden={true}>
            <Input />
          </Form.Item>
          <Form.Item name="parentNum" hidden={true}>
            <Input />
          </Form.Item>
          <Form.Item wrapperCol={{ offset: 4, span: 18 }}>
            <Space>
              <Button type="primary" htmlType="submit">保存</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default SubjectManager;