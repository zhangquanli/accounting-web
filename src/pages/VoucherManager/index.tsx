import React, { useEffect, useState } from 'react';
import { Button, Col, DatePicker, Divider, Form, Input, Modal, Row, Space, Table, TablePaginationConfig } from "antd";
import { ColumnsType } from "antd/es/table";
import styles from './index.module.scss';
import VoucherTemplate from "../../components/VoucherTemplate";
import { selectVouchers } from "../../services/voucherAPI";
import { useForm } from "antd/es/form/Form";

const { RangePicker } = DatePicker;

const initialPagination = { current: 1, pageSize: 2 };

const VoucherManager = () => {
  const columns: ColumnsType<any> = [
    {
      title: '编号',
      dataIndex: 'num',
      key: 'num',
    },
    {
      title: '记账日期',
      dataIndex: 'accountDate',
      key: 'accountDate',
    },
    {
      title: '借方金额',
      dataIndex: 'debitAmount',
      key: 'debitAmount',
      render: (value, record) => {
        const accountingEntries: any[] = record.accountingEntries;
        return accountingEntries.filter((item: any) => item.type === 'DEBIT')
          .map((item: any) => item.amount)
          .reduce((prev, current) => prev + current);
      },
    },
    {
      title: '贷方金额',
      dataIndex: 'creditAmount',
      key: 'creditAmount',
      render: (value, record) => {
        const accountingEntries: any[] = record.accountingEntries;
        return accountingEntries.filter((item: any) => item.type === 'CREDIT')
          .map((item: any) => item.amount)
          .reduce((prev, current) => prev + current);
      },
    },
    {
      title: '创建时间',
      dataIndex: 'createTime',
      key: 'createTime',
    },
    {
      title: '操作',
      dataIndex: 'operation',
      key: 'operation',
      render: (value, record) => {
        return (
          <>
            <Button type="link" onClick={() => {
              console.log(record)
              setVoucherTemplateId(record.id);
              setVisible(true);
            }}>详情</Button>
            <Divider type="vertical" />
            <Button type="link" danger={true}>冲红</Button>
          </>
        );
      },
    }
  ];

  const [vouchers, setVouchers] = useState<any[]>([]);

  const [form] = useForm();

  const [searchPagination, setSearchPagination] = useState<TablePaginationConfig>(initialPagination);

  const changeVouchers = async (searchParams: any, searchPagination: TablePaginationConfig) => {
    const { num, accountDateRange } = searchParams;
    const startAccountDate = accountDateRange && accountDateRange[0]
      && accountDateRange[0].format('YYYY-MM-DD');
    const endAccountDate = accountDateRange && accountDateRange[1]
      && accountDateRange[1].format('YYYY-MM-DD');
    const { current: page, pageSize: size } = searchPagination;
    const params = { num, startAccountDate, endAccountDate, page, size };
    const data = await selectVouchers(params);
    const { totalElements, content } = data;
    setSearchPagination(prev => {
      return { ...prev, total: totalElements };
    });
    setVouchers(content);
  };

  useEffect(() => {
    (async () => {
      await changeVouchers({}, initialPagination);
    })();
  }, []);

  const [visible, setVisible] = useState<boolean>(false);

  const [voucherTemplateId, setVoucherTemplateId] = useState<number | undefined>(undefined);

  return (
    <div className={styles.container}>
      <Form
        form={form}
        onFinish={async (values) => {
          await changeVouchers(values, searchPagination);
        }}
      >
        <Row gutter={16}>
          <Col span={4}>
            <Form.Item name="num" label="编号">
              <Input />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="accountDateRange" label="记账日期">
              <RangePicker />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Space>
              <Button type="default" htmlType="reset">重置</Button>
              <Button type="primary" htmlType="submit">查询</Button>
              <Button type="primary" onClick={() => {
                setVoucherTemplateId(undefined);
                setVisible(true);
              }}>新增</Button>
            </Space>
          </Col>
        </Row>
      </Form>
      <Table
        rowKey="id"
        columns={columns}
        dataSource={vouchers}
        pagination={searchPagination}
        onChange={async pagination => {
          const newPagination = { ...searchPagination, ...pagination };
          setSearchPagination(newPagination);
          await changeVouchers(form.getFieldsValue(), newPagination);
        }}
      />
      <Modal
        title="新增凭证"
        footer={null}
        width="100vh"
        visible={visible}
        onCancel={() => setVisible(false)}
      >
        <VoucherTemplate voucherId={voucherTemplateId} />
      </Modal>
    </div>
  );
};

export default VoucherManager;