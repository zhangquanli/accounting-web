import React, { useEffect, useState } from 'react';
import { Button, Col, Form, Input, InputNumber, message, Modal, Row, Space, Table, Tree } from "antd";
import { insertAccount, selectAccounts, updateAccount } from "../../services/accountAPI";
import styles from './index.module.scss';
import { useForm } from "antd/es/form/Form";
import { ColumnsType } from "antd/es/table";
import { selectSubjects } from "../../services/subjectAPI";
import Search from "antd/lib/input/Search";
import { selectSubjectBalances } from "../../services/subjectBalanceAPI";
import { array2Tree } from "../../utils/tree";

const AccountManager = () => {
  // 账簿数据
  const [queryForm] = useForm();
  const [accounts, setAccounts] = useState<any[]>([]);
  const changeAccounts = async () => {
    const values = queryForm.getFieldsValue();
    const data = await selectAccounts(values);
    setAccounts(data);
  };
  useEffect(() => {
    (async () => {
      const values = queryForm.getFieldsValue();
      const data = await selectAccounts(values);
      setAccounts(data);
    })();
  }, [queryForm]);

  // 新增账簿
  const [saveForm] = useForm();
  const [saveVisible, setSaveVisible] = useState<boolean>(false);
  const finishAccountSave = async (values: any) => {
    await insertAccount(values);
    message.success('保存成功');
  }

  // 管理账簿的会计科目
  const [subjectsVisible, setSubjectsVisible] = useState<boolean>(false);
  const [selectedAccount, setSelectedAccount] = useState<any>({});
  const [selectedSubjectIds, setSelectedSubjectIds] = useState<number[]>([]);
  const [initialBalances, setInitialBalances] = useState<any>({});
  useEffect(() => {
    (async () => {
      if (selectedAccount && selectedAccount.id) {
        const subjectBalances = await selectSubjectBalances({ accountId: selectedAccount.id });
        const selectedSubjectIds = (subjectBalances || []).map((item: any) => item.subject.id);
        setSelectedSubjectIds(selectedSubjectIds);
        const initialBalances: any = {};
        for (let element of (subjectBalances || [])) {
          initialBalances[element.subject.id] = element.initialAmount;
        }
        setInitialBalances(initialBalances);
      }
    })();
  }, [selectedAccount]);

  // 会计科目数据
  const [subjects, setSubjects] = useState<any[]>([]);
  useEffect(() => {
    (async () => {
      const subjects = await selectSubjects({});
      setSubjects(subjects);
    })();
  }, []);

  const [subjectTree, setSubjectTree] = useState<any[]>();

  useEffect(() => {
    (async () => {
      const subjectBalances = await selectSubjectBalances({ accountId: selectedAccount.id });
      const ids = (subjectBalances || []).map((subjectBalance: any) => subjectBalance.subject.id);
      const newSubjects = subjects.map(subject => {
        const disableCheckbox = ids.includes(subject.id);
        return { ...subject, disableCheckbox, selectable: false };
      })
      const tree = array2Tree(newSubjects, 'num', 'parentNum');
      setSubjectTree(tree);
    })();
  }, [subjects, selectedAccount]);

  const columns: ColumnsType<any> = [
    {
      title: '名称',
      dataIndex: 'name',
      key: 'name',
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
                setSubjectsVisible(true);
                setSelectedAccount(record);
              }}
            >
              管理科目
            </Button>
          </Space>
        );
      },
    },
  ];

  return (
    <div className={styles.container}>
      <Form form={queryForm} onFinish={changeAccounts}>
        <Row gutter={16}>
          <Col span={4}>
            <Form.Item name="name" label="名称">
              <Input />
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
                    setSaveVisible(true);
                    saveForm.resetFields();
                  }}
                >
                  新增
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
        dataSource={accounts}
        scroll={{ y: 540 }}
      />
      {/*新增账簿的模态框*/}
      <Modal
        title="新增账簿"
        visible={saveVisible}
        footer={null}
        onCancel={() => setSaveVisible(false)}
      >
        <Form
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 18 }}
          form={saveForm}
          onFinish={async (values) => {
            await finishAccountSave(values);
            setSaveVisible(false);
            await changeAccounts();
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
          <Form.Item wrapperCol={{ offset: 4, span: 18 }}>
            <Space>
              <Button type="primary" htmlType="submit">保存</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
      {/*管理科目的模态框*/}
      <Modal
        title="管理科目"
        visible={subjectsVisible}
        footer={null}
        onCancel={() => setSubjectsVisible(false)}
      >
        <Row>
          <Col span={24} style={{ border: '1px solid #f0f0f0', padding: '8px' }}>
            <Search style={{ marginBottom: '8px' }} placeholder="会计科目" />
            <Tree
              fieldNames={{ title: 'name', key: 'id', children: 'children' }}
              height={300}
              checkable={true}
              treeData={subjectTree}
              checkedKeys={selectedSubjectIds}
              titleRender={(nodeData) => {
                return (
                  <Space>
                    <Input value={nodeData.name} disabled={true} />
                    <InputNumber
                      placeholder="期初余额"
                      value={initialBalances[nodeData.id]}
                      disabled={nodeData.disableCheckbox}
                      onChange={(value) => {
                        const data = { ...initialBalances, [nodeData.id]: value };
                        setInitialBalances(data);
                      }}
                    />
                  </Space>
                );
              }}
              onCheck={(checkedKeys: any) => {
                setSelectedSubjectIds(checkedKeys);
              }}
            />
          </Col>
        </Row>
        <Row style={{ marginTop: '16px' }}>
          <Col offset={10} span={4}>
            <Button
              type="primary"
              onClick={async () => {
                const subjectBalances = selectedSubjectIds.map((subjectId) => {
                  return {
                    initialAmount: initialBalances[subjectId] || 0,
                    currentAmount: initialBalances[subjectId] || 0,
                    subject: { id: subjectId },
                  }
                });
                const account = { ...selectedAccount, subjectBalances };
                await updateAccount(selectedAccount.id, account);
                message.success('保存成功');
                setSubjectsVisible(false);
                await changeAccounts();
              }}>
              保存
            </Button>
          </Col>
        </Row>
      </Modal>
    </div>
  );
};

export default AccountManager;