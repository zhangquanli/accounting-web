import React, { useEffect, useState } from 'react';
import styles from "../VoucherManager/index.module.scss";
import { Button, Col, Form, Input, Row, Space, Table, TablePaginationConfig } from "antd";
import { useForm } from "antd/es/form/Form";
import { ColumnsType } from "antd/es/table";
import { selectAccountingEntries } from "../../services/accountingEntryAPI";
import { useAppSelector } from "../../app/hooks";

interface TableData {
  total: number;
  rows: any[];
}

const AccountingEntryManager = () => {
  const [form] = useForm();

  const activeAccountId = useAppSelector(state => state.userInfo.activeAccountId);

  const [searchParams, setSearchParams] = useState<any>({});

  const [pagination, setPagination] = useState<TablePaginationConfig>({
    current: 1,
    pageSize: 10,
  });

  const [tableData, setTableData] = useState<TableData>({
    total: 0,
    rows: [],
  });

  useEffect(() => {
    (async () => {
      const { current: page, pageSize: size } = pagination;
      const params = { page, size, accountId: activeAccountId, ...searchParams };
      const result = await selectAccountingEntries(params);
      const { totalElements: total, content: rows } = result;
      setTableData({ total, rows });
    })();
  }, [activeAccountId, searchParams, pagination]);

  const columns: ColumnsType<any> = [
    {
      title: '会计科目',
      dataIndex: 'subjectName',
      key: 'subjectName',
      render: (value, record) => {
        return record.subjectBalance.subject.name;
      },
    },
    {
      title: '借方',
      dataIndex: 'debitAmount',
      key: 'debitAmount',
      render: (value, record) => {
        const { type, amount } = record;
        if (type === 'DEBIT') {
          return amount;
        } else {
          return '';
        }
      },
    },
    {
      title: '贷方',
      dataIndex: 'creditAmount',
      key: 'creditAmount',
      render: (value, record) => {
        const { type, amount } = record;
        if (type === 'CREDIT') {
          return amount;
        } else {
          return '';
        }
      },
    },
    {
      title: '余额',
      dataIndex: 'balance',
      key: 'balance',
    },
    {
      title: '摘要',
      dataIndex: 'summary',
      key: 'summary',
    },
  ]

  return (
    <div className={styles.container}>
      <Form form={form} onFinish={values => setSearchParams({ ...values })}>
        <Row gutter={16}>
          <Col span={4}>
            <Form.Item name="subjectIds" label="会计科目">
              <Input />
            </Form.Item>
          </Col>
          <Col span={4}>
            <Form.Item name="labelIds" label="标签">
              <Input />
            </Form.Item>
          </Col>
          <Col span={4}>
            <Form.Item name="summary" label="摘要">
              <Input />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Space>
              <Button type="default" htmlType="reset">重置</Button>
              <Button type="primary" htmlType="submit">查询</Button>
            </Space>
          </Col>
        </Row>
      </Form>
      <Table
        scroll={{ y: 400 }}
        rowKey="id"
        columns={columns}
        dataSource={tableData.rows}
        pagination={{ ...pagination, total: tableData.total }}
        onChange={pagination => setPagination({ ...pagination })}
      />
    </div>
  );
};

export default AccountingEntryManager;