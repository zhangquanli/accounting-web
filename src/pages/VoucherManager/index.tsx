import React, { useEffect, useState } from 'react';
import { Button, Col, DatePicker, Form, Input, Modal, Row, Space, Table, TablePaginationConfig } from "antd";
import { ColumnsType } from "antd/es/table";
import styles from './index.module.scss';
import VoucherTemplate from "../../components/VoucherTemplate";
import { selectVouchers } from "../../services/voucherAPI";
import { useForm } from "antd/es/form/Form";
import { useAppSelector } from "../../app/hooks";

interface ModalProps {
  visible: boolean;
  templateName: string | undefined;
  voucherId: number | undefined;
}

const { RangePicker } = DatePicker;

const VoucherManager = () => {
  const activeAccountId = useAppSelector(state => state.userInfo.activeAccountId);

  const columns: ColumnsType<any> = [
    {
      title: '编号',
      dataIndex: 'num',
      key: 'num',
    },
    {
      title: '凭证类型',
      dataIndex: 'originalVoucher',
      key: 'originalVoucher',
      render: (value) => {
        return value ? '冲红凭证' : '原始凭证';
      },
    },
    {
      title: '凭证状态',
      dataIndex: 'invalidVoucher',
      key: 'invalidVoucher',
      render: (value) => {
        return value ? (
          <div style={{ color: 'red' }}>已冲红</div>
        ) : (
          <div style={{ color: 'green' }}>正常</div>
        );
      },
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
              setModalProps({
                visible: true,
                templateName: '凭证详情',
                voucherId: record.id,
              });
            }}
            >详情</Button>
            {record.originalVoucher ? (
              <Button type="link" style={{ color: 'green' }} onClick={() => {
                setModalProps({
                  visible: true,
                  templateName: '凭证详情',
                  voucherId: record.originalVoucher.id,
                });
              }}>原始凭证</Button>
            ) : null}
            {record.invalidVoucher ? (
              <Button type="link" style={{ color: 'red' }} onClick={() => {
                setModalProps({
                  visible: true,
                  templateName: '凭证详情',
                  voucherId: record.invalidVoucher.id,
                });
              }}>冲红凭证</Button>
            ) : null}
          </>
        );
      },
    }
  ];

  const [form] = useForm();

  const [searchParams, setSearchParams] = useState<any>({});

  const [vouchers, setVouchers] = useState<any[]>([]);

  const [total, setTotal] = useState<number>(0);

  const [pagination, setPagination] = useState<TablePaginationConfig>({
    current: 1,
    pageSize: 5,
  });

  useEffect(() => {
    (async () => {
      const { current: page, pageSize: size } = pagination;
      const { num, accountDateRange } = searchParams;
      const startAccountDate = accountDateRange && accountDateRange[0]
        && accountDateRange[0].format('YYYY-MM-DD');
      const endAccountDate = accountDateRange && accountDateRange[1]
        && accountDateRange[1].format('YYYY-MM-DD');
      const params = {
        page, size,
        accountId: activeAccountId,
        num, startAccountDate, endAccountDate,
      };
      const data = await selectVouchers(params);
      const { totalElements, content } = data;
      setTotal(totalElements);
      setVouchers(content);
    })();
  }, [activeAccountId, searchParams, pagination]);


  // 凭证模板
  const [modalProps, setModalProps] = useState<ModalProps>({
    visible: false,
    voucherId: undefined,
    templateName: undefined,
  });

  return (
    <div className={styles.container}>
      <Form
        form={form}
        onFinish={(values) => setSearchParams({ ...searchParams, ...values })}
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
                setModalProps({
                  visible: true,
                  templateName: '凭证新增',
                  voucherId: undefined,
                })
              }}>新增</Button>
            </Space>
          </Col>
        </Row>
      </Form>
      <Table
        scroll={{ y: 400 }}
        rowKey="id"
        columns={columns}
        dataSource={vouchers}
        pagination={{ ...pagination, total }}
        onChange={(values) => setPagination({ ...values })}
      />
      <Modal
        title={modalProps.templateName}
        footer={null}
        width="1000px"
        visible={modalProps.visible}
        onCancel={() => setModalProps({ ...modalProps, visible: false })}
      >
        <VoucherTemplate
          voucherId={modalProps.voucherId}
          onSave={() => {
            setModalProps({
              visible: false,
              templateName: undefined,
              voucherId: undefined,
            });
            setSearchParams({ ...searchParams });
          }}
          onInvalid={() => {
            setModalProps({
              visible: false,
              templateName: undefined,
              voucherId: undefined,
            });
            setSearchParams({ ...searchParams });
          }}
        />
      </Modal>
    </div>
  );
};

export default VoucherManager;