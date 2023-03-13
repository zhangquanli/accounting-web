import React, { useEffect, useState } from "react";
import {
  Button,
  DatePicker,
  Form,
  Input,
  Modal,
  Table,
  TablePaginationConfig,
} from "antd";
import { ColumnsType } from "antd/es/table";
import styles from "./index.module.scss";
import VoucherTemplate from "../../components/VoucherTemplate";
import { useForm } from "antd/es/form/Form";
import { useAppSelector } from "../../app/hooks";
import ajax from "../../utils/ajax";

const { RangePicker } = DatePicker;

interface QueryParams {
  num: string | undefined;
  accountDateRange: any[];
}

interface TableParams {
  pagination: TablePaginationConfig;
}

interface Voucher {
  id?: number;
  num: string;
  accountDate: string;
  createTime?: string;
  accountingEntries: any[];
  account: any;
  originalVoucher: any;
  invalidVoucher: any;
}

interface VoucherModal {
  visible: boolean;
  templateName?: string;
  voucherId?: number;
}

interface Props {}

const VoucherManager: React.FC<Props> = () => {
  const activeAccountId = useAppSelector(
    (state) => state.userInfo.activeAccountId
  );

  const [queryForm] = useForm<QueryParams>();
  const [queryParams, setQueryParams] = useState<QueryParams>({
    num: "",
    accountDateRange: [],
  });
  const [columns, setColumns] = useState<ColumnsType<Voucher>>([]);
  const [dataSource, setDataSource] = useState<Voucher[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [tableParams, setTableParams] = useState<TableParams>({
    pagination: {
      current: 1,
      pageSize: 20,
    },
  });

  const [voucherModal, setVoucherModal] = useState<VoucherModal>({
    visible: false,
    voucherId: undefined,
    templateName: undefined,
  });

  useEffect(() => {
    const filterColumns: ColumnsType<Voucher> = [
      {
        title: "编号",
        dataIndex: "num",
        key: "num",
      },
      {
        title: "凭证类型",
        dataIndex: "originalVoucher",
        key: "originalVoucher",
        render: (value) => {
          return value ? "冲红凭证" : "原始凭证";
        },
      },
      {
        title: "凭证状态",
        dataIndex: "invalidVoucher",
        key: "invalidVoucher",
        render: (value) => {
          return value ? (
            <div style={{ color: "red" }}>已冲红</div>
          ) : (
            <div style={{ color: "green" }}>正常</div>
          );
        },
      },
      {
        title: "记账日期",
        dataIndex: "accountDate",
        key: "accountDate",
      },
      {
        title: "借方金额",
        dataIndex: "debitAmount",
        key: "debitAmount",
        render: (value, record) => {
          const accountingEntries: any[] = record.accountingEntries;
          if (accountingEntries && accountingEntries.length > 0) {
            return accountingEntries
              .filter((item: any) => item.type === "DEBIT")
              .map((item: any) => item.amount)
              .reduce((prev, current) => 0 + prev + current);
          } else {
            return 0;
          }
        },
      },
      {
        title: "贷方金额",
        dataIndex: "creditAmount",
        key: "creditAmount",
        render: (value, record) => {
          const accountingEntries: any[] = record.accountingEntries;
          if (accountingEntries && accountingEntries.length > 0) {
            return accountingEntries
              .filter((item) => item.type === "CREDIT")
              .map((item: any) => item.amount)
              .reduce((prev, current) => 0 + prev + current);
          } else {
            return 0;
          }
        },
      },
      {
        title: "创建时间",
        dataIndex: "createTime",
        key: "createTime",
      },
      {
        title: "操作",
        dataIndex: "operation",
        key: "operation",
        render: (value, record) => {
          return (
            <>
              <Button
                type="link"
                onClick={() => {
                  setVoucherModal({
                    visible: true,
                    templateName: "凭证详情",
                    voucherId: record.id,
                  });
                }}
              >
                详情
              </Button>
              {record.originalVoucher && (
                <Button
                  type="link"
                  style={{ color: "green" }}
                  onClick={() => {
                    setVoucherModal({
                      visible: true,
                      templateName: "凭证详情",
                      voucherId: record.originalVoucher.id,
                    });
                  }}
                >
                  原始凭证
                </Button>
              )}
              {record.invalidVoucher && (
                <Button
                  type="link"
                  style={{ color: "red" }}
                  onClick={() => {
                    setVoucherModal({
                      visible: true,
                      templateName: "凭证详情",
                      voucherId: record.invalidVoucher.id,
                    });
                  }}
                >
                  冲红凭证
                </Button>
              )}
            </>
          );
        },
      },
    ];
    setColumns(filterColumns);
  }, []);

  useEffect(() => {
    (async () => {
      const { accountDateRange } = queryParams;
      const startAccountDate =
        accountDateRange &&
        accountDateRange[0] &&
        accountDateRange[0].format("YYYY-MM-DD");
      const endAccountDate =
        accountDateRange &&
        accountDateRange[1] &&
        accountDateRange[1].format("YYYY-MM-DD");
      const params = {
        current: tableParams.pagination.current,
        pageSize: tableParams.pagination.pageSize,
        accountId: activeAccountId,
        num: queryParams.num,
        startAccountDate,
        endAccountDate,
      };
      const data: any = await ajax.get("/vouchers", params);
      const { totalElements, content } = data;
      setTotal(totalElements);
      setDataSource(content);
    })();
  }, [activeAccountId, queryParams, tableParams]);

  return (
    <div className={styles.container}>
      <Form
        form={queryForm}
        onFinish={(values) => setQueryParams({ ...values })}
      >
        <div className={styles.form}>
          <div className={styles.formItem}>
            <Form.Item name="num" label="编号">
              <Input />
            </Form.Item>
          </div>
          <div className={styles.formItem}>
            <Form.Item name="accountDateRange" label="记账日期">
              <RangePicker />
            </Form.Item>
          </div>
          <div className={styles.formItem}>
            <Button type="default" htmlType="reset">
              重置
            </Button>
          </div>
          <div className={styles.formItem}>
            <Button type="primary" htmlType="submit">
              查询
            </Button>
          </div>
          <div className={styles.formItem}>
            <Button
              type="primary"
              onClick={() => {
                setVoucherModal({
                  visible: true,
                  templateName: "凭证新增",
                  voucherId: undefined,
                });
              }}
            >
              新增
            </Button>
          </div>
        </div>
      </Form>
      <Table
        scroll={{ y: 300 }}
        rowKey="id"
        bordered={true}
        columns={columns}
        dataSource={dataSource}
        pagination={{ ...tableParams.pagination, total }}
        onChange={(values) => setTableParams({ pagination: { ...values } })}
      />
      <Modal
        title={voucherModal.templateName}
        footer={null}
        width="1000px"
        visible={voucherModal.visible}
        onCancel={() => setVoucherModal({ ...voucherModal, visible: false })}
      >
        <VoucherTemplate
          voucherId={voucherModal.voucherId}
          onSave={() => {
            setVoucherModal({
              visible: false,
              templateName: undefined,
              voucherId: undefined,
            });
            // setSearchParams({ ...searchParams });
          }}
          onInvalid={() => {
            setVoucherModal({
              visible: false,
              templateName: undefined,
              voucherId: undefined,
            });
            // setSearchParams({ ...searchParams });
          }}
        />
      </Modal>
    </div>
  );
};

export default VoucherManager;
