import React, { useEffect, useState } from 'react';
import { useAppSelector } from "../../app/hooks";
import { Button, Cascader, Empty, Form, Input, List, message, Modal } from "antd";
import { insertAccount, selectAccounts } from "../../services/account";
import styles from './index.module.scss';

const AccountManager = () => {
  const [accounts, setAccounts] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      const data = await selectAccounts();
      setAccounts(data);
    })();
  }, []);

  const onFinish = async (values: any) => {
    const { name, subjectIds } = values;
    const unrepeatedIds = new Set();
    for (const items of subjectIds) {
      for (const item of items) {
        unrepeatedIds.add(item);
      }
    }
    const subjectBalances = Array.from(unrepeatedIds).map(id => ({ subject: { id } }));
    const account = { name, subjectBalances };
    await insertAccount(account);
    await message.success('保存成功');
  }

  const [visible, setVisible] = useState<boolean>(false);

  return (
    <div className={styles.container}>
      <div className={styles.list}>
        <List
          header={<div>账簿列表</div>}
          bordered={true}
          dataSource={accounts}
          rowKey="id"
          renderItem={item => {
            return (
              <List.Item>
                <Button type="link">{item.name}</Button>
              </List.Item>
            );
          }}
        />
      </div>
      <div className={styles.tree}>
        <Empty />
      </div>
      <Modal
        title="新增账簿"
        footer={false}
        visible={visible}
        onCancel={() => setVisible(false)}
      >
        <Form
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 16 }}
          onFinish={onFinish}
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
            name="subjectIds"
            label="科目"
            rules={[
              { required: true, message: '请选择科目' }
            ]}
          >
            <Cascader
              multiple={true}
              fieldNames={{ value: 'id', label: 'name' }}
              options={[]}
            />
          </Form.Item>
          <Form.Item wrapperCol={{ offset: 4, span: 16 }}>
            <Button type="primary" htmlType="submit">保存</Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default AccountManager;