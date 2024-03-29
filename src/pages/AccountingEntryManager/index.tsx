import React, { useEffect, useState } from 'react';
import styles from "../VoucherManager/index.module.scss";
import {
  Button,
  Cascader,
  Col,
  DatePicker,
  Form,
  Input,
  message,
  Modal,
  Row,
  Select,
  Space,
  Table,
  TablePaginationConfig,
  Tag
} from "antd";
import { useForm } from "antd/es/form/Form";
import { ColumnsType } from "antd/es/table";
import { exportAccountingEntries, selectAccountingEntries } from "../../services/accountingEntryAPI";
import { useAppSelector } from "../../app/hooks";
import { array2Tree, searchTreeProps } from "../../utils/tree";
import { selectSubjectBalances } from "../../services/subjectBalanceAPI";
import { selectLabels } from "../../services/labelAPI";
import VoucherTemplate from "../../components/VoucherTemplate";

const { RangePicker } = DatePicker;

interface TableData {
  total: number;
  rows: any[];
}

const AccountingEntryManager = () => {
  const [form] = useForm();

  // 激活的账簿ID
  const activeAccountId = useAppSelector(state => state.userInfo.activeAccountId);

  // 表格的查询参数
  const [queryParams, setQueryParams] = useState<any>({});

  // 表格的分页参数
  const [pagination, setPagination] = useState<TablePaginationConfig>({
    current: 1,
    pageSize: 10,
  });

  // 表格数据
  const [tableData, setTableData] = useState<TableData>({
    total: 0,
    rows: [],
  });

  const toSearchParams = (queryParams: any) => {
    const { voucherDateRange, subjects, labelId, summary } = queryParams;
    const startVoucherDate = (voucherDateRange || [])[0]?.format('YYYY-MM-DD');
    const endVoucherDate = (voucherDateRange || [])[1]?.format('YYYY-MM-DD');
    const subjectId = subjects && subjects[subjects.length - 1];
    return {
      startVoucherDate, endVoucherDate,
      subjectId, labelId, summary
    };
  };

  // 根据激活账簿、查询参数和分页参数，改变表格数据
  useEffect(() => {
    (async () => {
      const { current: page, pageSize: size } = pagination;
      const searchParams = toSearchParams(queryParams);
      const params = {
        page, size,
        accountId: activeAccountId,
        ...searchParams,
      };
      const result = await selectAccountingEntries(params);
      const { totalElements: total, content: rows } = result;
      setTableData({ total, rows });
    })();
  }, [activeAccountId, queryParams, pagination]);

  // 当前账簿的会计科目
  const [subjectTree, setSubjectTree] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      const result = await selectSubjectBalances({ accountId: activeAccountId });
      const data = result.map((item: any) => ({ ...item.subject }));
      const tree = array2Tree(data, 'num', 'parentNum');
      setSubjectTree(tree);
      form.setFieldsValue({ subjectIds: undefined });
    })();
  }, [activeAccountId, form]);

  // 标签数据
  const [labelOptions, setLabelOptions] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      const result = await selectLabels();
      setLabelOptions(result);
    })();
  }, []);

  // 模态框
  const [modalProps, setModalProps] = useState<any>({
    visible: false,
    voucherId: undefined,
  });

  const columns: ColumnsType<any> = [
    {
      title: '凭证日期',
      dataIndex: 'voucherDate',
      key: 'voucherDate',
      render: (value, record) => {
        return record.voucher.accountDate;
      },
    },
    {
      title: '凭证编号',
      dataIndex: 'voucherNum',
      key: 'voucherNum',
      render: (value, record) => {
        return record.voucher.num;
      },
    },
    {
      title: '凭证状态',
      dataIndex: 'invalidAccountingEntry',
      key: 'invalidAccountingEntry',
      render: (value) => {
        return value ? (
          <div style={{ color: 'red' }}>已冲红</div>
        ) : (
          <div style={{ color: 'green' }}>正常</div>
        );
      },
    },
    {
      title: '会计科目',
      dataIndex: 'subjectNames',
      key: 'subjectNames',
      render: (value, record) => {
        const subjectId = record.subjectBalance.subject.id;
        const fieldNames = { id: 'id', children: 'children', prop: 'name' };
        const props = searchTreeProps(subjectTree, fieldNames, subjectId);
        return props.join('-');
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
          return '---';
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
          return '---';
        }
      },
    },
    {
      title: '余额',
      dataIndex: 'balance',
      key: 'balance',
    },
    {
      title: '标签',
      dataIndex: 'labelNames',
      key: 'labelNames',
      render: (value, record) => {
        const { labels } = record;
        return (labels || []).map((label: any) => <Tag key={label.id}>{label.value}</Tag>);
      },
    },
    {
      title: '摘要',
      dataIndex: 'summary',
      key: 'summary',
    },
    {
      title: '操作',
      dataIndex: 'operation',
      key: 'operation',
      render: (value, record) => {
        return (
          <Button type="link" onClick={() => {
            setModalProps({ visible: true, voucherId: record.voucher.id })
          }}>凭证详情</Button>
        );
      }
    },
  ]

  return (
    <div className={styles.container}>
      <Form form={form} onFinish={values => setQueryParams({ ...values })}>
        <Row gutter={16}>
          <Col span={8}>
            <Form.Item name="subjects" label="会计科目">
              <Cascader fieldNames={{ value: 'id', label: 'name' }} options={subjectTree} />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="labelId" label="标签">
              <Select allowClear={true} fieldNames={{ value: 'id', label: 'mark' }} options={labelOptions} />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="summary" label="摘要">
              <Input />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="voucherDateRange" label="凭证日期">
              <RangePicker style={{ width: '100%' }} />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Space>
              <Button type="default" htmlType="reset">重置</Button>
              <Button type="primary" htmlType="submit">查询</Button>
              <Button type="primary" htmlType="submit" onClick={() => {
                const params = toSearchParams(form.getFieldsValue());
                exportAccountingEntries(params).then(() => {
                  message.destroy();
                  message.success('导出文件成功').then(undefined);
                }).catch(() => {
                  message.destroy();
                  message.error('下载失败').then(undefined);
                });
              }}>导出</Button>
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
      <Modal
        title="凭证详情"
        footer={null}
        width="1000px"
        visible={modalProps.visible}
        onCancel={() => setModalProps({ visible: false })}
      >
        <VoucherTemplate
          voucherId={modalProps.voucherId}
          onInvalid={() => {
            setModalProps({ visible: false });
            setQueryParams({ ...queryParams });
          }}
        />
      </Modal>
    </div>
  );
};

export default AccountingEntryManager;