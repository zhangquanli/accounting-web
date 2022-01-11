import React, { FC, useEffect, useState } from 'react';
import { Button, Cascader, Col, DatePicker, Input, InputNumber, message, Row, Select } from "antd";
import styles from './index.module.scss';
import { nanoid } from "@reduxjs/toolkit";
import { CloseCircleOutlined } from "@ant-design/icons";
import { capitalAmount } from "../../utils/money";
import { useAppSelector } from "../../app/hooks";
import { getVoucher, insertVoucher } from "../../services/voucherAPI";
import { selectLabels } from "../../services/labelAPI";
import moment, { Moment } from "moment";

interface Props {
  voucherId?: number;
}

interface AccountingEntry {
  key: string;
  summary?: string;
  type?: 'DEBIT' | 'CREDIT';
  amount?: number;
  subjectBalanceIds?: number[];
  labels?: string[];
}

interface Voucher {
  id?: number;
  num?: string;
  accountDate?: Moment;
  accountingEntries: AccountingEntry[];
}

const initialVoucher: Voucher = {
  accountingEntries: [
    { key: nanoid() },
    { key: nanoid() },
  ]
};

const getFullIds = (options: any[], id: number) => {
  const ids: any[] = [];
  deepSearch(options, id, ids);
  return ids;
};

const deepSearch = (options: any[], id: number, ids: any[]) => {
  if (options && options.length > 0) {
    for (let option of options) {
      ids.push(option.id);
      if (option.children && option.children.length > 0) {
        deepSearch(option.children, id, ids);
        if (ids.includes(id)) {
          break;
        }
      }
      if (option.id === id) {
        break;
      } else {
        ids.pop();
      }
    }
  }
  return false;
}

const VoucherTemplate: FC<Props> = ({ voucherId }) => {
  const [labelOptions, setLabelOptions] = useState<any[]>([]);

  // 初始化标签选项
  useEffect(() => {
    (async () => {
      const data = await selectLabels();
      const options = data.map((item: any) => {
        const { name } = item;
        return { value: name, label: name };
      })
      setLabelOptions(options);
    })();
  }, []);

  // 科目余额数据
  const subjectBalanceOptions = useAppSelector(state => state.subjectBalance.options);

  // 凭证
  const [voucher, setVoucher] = useState<Voucher>(initialVoucher);

  const updateVoucher = (name: string, value: any) => {
    const data = { ...voucher, [name]: value };
    setVoucher(data);
  };

  const insertAccountEntry = () => {
    const { accountingEntries } = voucher;
    const newAccountEntries = [...accountingEntries, { key: nanoid() }];
    setVoucher({ ...voucher, accountingEntries: newAccountEntries });
  };

  const deleteAccountEntry = (key: string) => {
    const { accountingEntries } = voucher;
    const newAccountEntries = accountingEntries.filter(item => item.key !== key)
    setVoucher({ ...voucher, accountingEntries: newAccountEntries });
  };

  const updateAccountEntry = (key: string, pairs: { name: string, value: any }[]) => {
    const { accountingEntries } = voucher;
    const newAccountEntries = accountingEntries.map(item => {
      if (item.key === key) {
        const newItem: any = { ...item };
        for (let pair of pairs) {
          newItem[pair.name] = pair.value;
        }
        return newItem;
      } else {
        return item;
      }
    });
    setVoucher({ ...voucher, accountingEntries: newAccountEntries });
  };

  // 初始化数据
  useEffect(() => {
    (async () => {
      if (voucherId) {
        const data = await getVoucher(voucherId);
        const { id, num, accountDate, accountingEntries } = data;
        const newAccountingEntries = accountingEntries.map((accountEntry: any) => {
          const { id, summary, type, amount, labels, subjectBalance } = accountEntry;
          const subjectBalanceIds = getFullIds(subjectBalanceOptions, subjectBalance.id);
          console.log(subjectBalanceIds)
          return {
            key: id,
            summary, type, amount, subjectBalanceIds,
            labels: labels.map((item: any) => item.name),
          };
        });
        setVoucher({
          id, num,
          accountDate: moment(accountDate),
          accountingEntries: newAccountingEntries,
        });
      } else {
        setVoucher(initialVoucher);
      }
    })();
  }, [voucherId])

  // 借贷金额
  const moneyAmount = (type: 'DEBIT' | 'CREDIT') => {
    const amount = voucher.accountingEntries.filter(item => item.type === type)
      .map(item => item.amount)
      .reduce((prev, current) => {
        return (prev ? prev : 0) + (current ? current : 0);
      }, 0);
    return (amount && amount > 0) ? amount : undefined;
  };

  const debitAmount = moneyAmount('DEBIT');

  const creditAmount = moneyAmount('CREDIT');

  // 保存凭证
  const saveVoucher = async () => {
    const { num, accountDate } = voucher;
    if (!num) {
      await message.error('请输入编号');
      return;
    }
    if (!accountDate) {
      await message.error('请输入日期');
      return;
    }
    if (!(debitAmount && creditAmount)) {
      await message.error('借贷不平');
      return;
    }
    if (debitAmount !== creditAmount) {
      await message.error('借贷不平');
      return;
    }

    const newAccountingEntries = voucher.accountingEntries.filter(item => {
      const { amount, subjectBalanceIds } = item;
      return amount && amount > 0 && subjectBalanceIds && subjectBalanceIds.length > 0;
    }).map(item => {
      const { amount, type, summary, subjectBalanceIds, labels } = item;
      const newLabels = labels && labels.map((name: any) => ({ name }));
      return {
        amount, type, summary,
        labels: newLabels,
        subjectBalance: {
          id: subjectBalanceIds && subjectBalanceIds[subjectBalanceIds.length - 1],
        },
      };
    });
    const data = {
      num, accountingEntries: newAccountingEntries,
      accountDate: accountDate?.format('YYYY-MM-DD'),
    };
    await insertVoucher(data);
  };

  // 冲红凭证
  const invalidVoucher = async () => {

  };

  return (
    <div className={styles.container}>
      <Row>
        <Col className={styles.title} span={24}>记账凭证</Col>
      </Row>
      <Row>
        <Col span={12} />
        <Col className={styles.label} span={2}>日期：</Col>
        <Col className={styles.name} span={4}>
          <DatePicker
            placeholder="请选择日期"
            allowClear={false}
            value={voucher.accountDate}
            onChange={value => updateVoucher('accountDate', value)}
            disabled={voucherId !== undefined}
          />
        </Col>
        <Col className={styles.label} span={2}>编号：</Col>
        <Col className={styles.name} span={4}>
          <Input
            placeholder="请输入编号"
            allowClear={false}
            value={voucher.num}
            onChange={event => updateVoucher('num', event.target.value)}
            disabled={voucherId !== undefined}
          />
        </Col>
      </Row>
      <Row style={{ marginTop: '1rem' }}>
        <Col className={`${styles.border} ${styles.center}`} span={4}>摘要</Col>
        <Col className={`${styles.border} ${styles.center}`} span={4}>标签</Col>
        <Col className={`${styles.border} ${styles.center}`} span={10}>会计科目</Col>
        <Col className={`${styles.border} ${styles.center}`} span={3}>借方金额</Col>
        <Col className={`${styles.border} ${styles.center}`} span={3}>贷方金额</Col>
      </Row>
      {voucher.accountingEntries.map(item => (
        <Row key={item.key}>
          {/*摘要*/}
          <Col className={`${styles.border} ${styles.center}`} span={4}>
            {!voucherId && (
              <CloseCircleOutlined
                style={{ color: 'red', marginLeft: '.5rem' }}
                onClick={() => deleteAccountEntry(item.key)}
              />
            )}
            <Input
              style={{ width: '100%' }}
              bordered={false}
              value={item.summary}
              onChange={event => {
                const { value } = event.target;
                updateAccountEntry(item.key, [{ name: 'summary', value }]);
              }}
              disabled={voucherId !== undefined}
            />
          </Col>
          {/*标签*/}
          <Col className={`${styles.border} ${styles.center}`} span={4}>
            <Select
              style={{ width: '100%' }}
              bordered={false}
              mode="tags"
              options={labelOptions}
              value={item.labels}
              onChange={value => {
                updateAccountEntry(item.key, [{ name: 'labels', value }])
              }}
              disabled={voucherId !== undefined}
            />
          </Col>
          {/*会计科目*/}
          <Col className={`${styles.border} ${styles.center}`} span={10}>
            <Cascader
              style={{ width: '100%' }}
              bordered={false}
              expandTrigger="hover"
              changeOnSelect={true}
              fieldNames={{ label: 'name', value: 'id' }}
              options={subjectBalanceOptions}
              value={item.subjectBalanceIds}
              showSearch={{
                filter: (inputValue, options) => {
                  return options.some((option: any) => option.name.indexOf(inputValue.toLowerCase()) > -1);
                }
              }}
              onChange={(value: any) => {
                updateAccountEntry(item.key, [{ name: 'subjectBalanceIds', value }]);
              }}
              disabled={voucherId !== undefined}
              displayRender={(nodes, selectedOptions) => {
                return selectedOptions.map((option: any, index) => {
                  if (index === selectedOptions.length - 1) {
                    return (
                      <span key={option.id}>
                        {option.subject.name} (<span>{['ASSETS', 'COST'].includes(option.subject.category) ? '借' : '贷'}:{option.currentAmount}</span>)
                      </span>
                    );
                  } else {
                    return (<span key={option.id}>{option.subject.name} / </span>)
                  }
                });
              }}
            />
          </Col>
          {/*借方金额*/}
          <Col className={`${styles.border} ${styles.center}`} span={3}>
            <InputNumber
              style={{ width: '100%' }}
              bordered={false}
              value={(item.type && item.type === 'DEBIT') ? item.amount : undefined}
              onChange={value => {
                const pairs = [
                  { name: 'type', value: 'DEBIT' },
                  { name: 'amount', value },
                ];
                updateAccountEntry(item.key, pairs);
              }}
              disabled={voucherId !== undefined}
            />
          </Col>
          {/*贷方金额*/}
          <Col className={`${styles.border} ${styles.center}`} span={3}>
            <InputNumber
              style={{ width: '100%' }}
              bordered={false}
              value={(item.type && item.type === 'CREDIT') ? item.amount : undefined}
              onChange={value => {
                const pairs = [
                  { name: 'type', value: 'CREDIT' },
                  { name: 'amount', value },
                ];
                updateAccountEntry(item.key, pairs);
              }}
              disabled={voucherId !== undefined}
            />
          </Col>
        </Row>
      ))}
      {voucherId === undefined && (
        <Row>
          <Col className={`${styles.border} ${styles.center}`} span={24}>
            <Button type="link" onClick={insertAccountEntry} style={{ width: '100%' }}>添加</Button>
          </Col>
        </Row>
      )}
      <Row>
        <Col className={`${styles.border} ${styles.center}`} span={8}>合计</Col>
        <Col className={`${styles.border} ${styles.center}`} span={10}>
          {(debitAmount && creditAmount && debitAmount === creditAmount) ? (
            <div style={{ color: "green" }}>{capitalAmount(debitAmount)}</div>
          ) : (
            <div style={{ color: "red" }}>借贷不平</div>
          )}
        </Col>
        <Col className={`${styles.border} ${styles.center}`} span={3}>
          <InputNumber
            style={{ width: '100%' }}
            bordered={false}
            disabled={true}
            value={debitAmount}
          />
        </Col>
        <Col className={`${styles.border} ${styles.center}`} span={3}>
          <InputNumber
            style={{ width: '100%' }}
            bordered={false}
            disabled={true}
            value={creditAmount}
          />
        </Col>
      </Row>
      <Row style={{ marginTop: '1rem' }}>
        <Col className={styles.center} span={24}>
          {voucherId ? (
            <Button type="link" danger={true} onClick={invalidVoucher}>冲红</Button>
          ) : (
            <Button type="link" onClick={saveVoucher}>提交</Button>
          )}
        </Col>
      </Row>
    </div>
  );
};

export default VoucherTemplate;