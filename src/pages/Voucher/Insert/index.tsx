import React, { useEffect, useState } from 'react';
import { Button, Cascader, Col, DatePicker, Input, InputNumber, message, Row, Select } from "antd";
import styles from './index.module.scss';
import { Moment } from "moment";
import { nanoid } from "@reduxjs/toolkit";
import { CloseCircleOutlined } from "@ant-design/icons";
import { capitalAmount } from "../../../utils/money";
import ajax from "../../../utils/ajax";
import { useAppDispatch, useAppSelector } from "../../../app/hooks";
import { reloadSubjects } from "../../../redux/subjectSlice";
import { insertVoucher } from "../../../services/voucherAPI";

interface Voucher {
  num?: number;
  accountDate?: Moment;
}

interface Account {
  key: string;
  amount?: number;
  type?: 'DEBIT' | 'CREDIT';
  summary?: string;
  labels?: string[];
  subjectIds?: number[];
}

interface Option {
  value: string | number;
  label: string;
  children?: Option[];
}

const InsertVoucher = () => {
  // 标签数据
  const [labelOptions, setLabelOptions] = useState<Option[]>([]);
  useEffect(() => {
    (async () => {
      try {
        const data = await ajax.get('/labels');
        const options: Option[] = data.map((item: any) => {
          const { name } = item;
          return { value: name, label: name };
        })
        setLabelOptions(options);
      } catch (e) {
        setLabelOptions([]);
      }
    })();
  }, []);

  // 科目数据
  const subjectOptions = useAppSelector(state => state.subject.data);

  // 凭证
  const [voucher, setVoucher] = useState<Voucher>({});
  const updateVoucher = (pairs: { name: string, value: any }) => {
    const newVoucher = { ...voucher, [pairs.name]: pairs.value };
    setVoucher(newVoucher);
  };

  // 账目集合
  const [accounts, setAccounts] = useState<Account[]>([{ key: nanoid() }]);
  const insertAccount = () => {
    setAccounts([...accounts, { key: nanoid() }]);
  };
  const deleteAccount = (key: string) => {
    const newAccounts = accounts.filter(item => item.key !== key)
    setAccounts(newAccounts);
  };
  const updateAccount = (key: string, pairs: { name: string, value: any }[]) => {
    const newAccounts = accounts.map(item => {
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
    setAccounts(newAccounts);
  };

  // 借贷金额
  const moneyAmount = (type: 'DEBIT' | 'CREDIT') => {
    const amount = accounts.filter(item => item.type === type)
      .map(item => item.amount)
      .reduce((prev, current) => {
        return (prev ? prev : 0) + (current ? current : 0);
      }, 0);
    return (amount && amount > 0) ? amount : undefined;
  };
  const debitAmount = moneyAmount('DEBIT');
  const creditAmount = moneyAmount('CREDIT');

  // 提交
  const submit = async () => {
    if (!(debitAmount && creditAmount)) {
      await message.error('借贷不平');
      return;
    }
    if (debitAmount !== creditAmount) {
      await message.error('借贷不平');
      return;
    }
    const newAccounts = accounts.filter(item => {
      const { subjectIds, amount } = item;
      return amount && amount > 0 && subjectIds && subjectIds.length > 0;
    }).map(item => {
      const { amount, type, summary, subjectIds, labels } = item;
      const newLabels = labels && labels.map(name => ({ name }));
      return {
        amount, type, summary,
        subject: { id: subjectIds && subjectIds[subjectIds.length - 1] },
        labels: newLabels,
      };
    });
    const { num, accountDate } = voucher;
    const newVoucher = {
      num, accounts: newAccounts,
      accountDate: accountDate?.format('YYYY-MM-DD'),
    };
    await insertVoucher(newVoucher);
  };

  return (
    <>
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
              onChange={value => updateVoucher({ name: 'accountDate', value })}
            />
          </Col>
          <Col className={styles.label} span={2}>编号：</Col>
          <Col className={styles.name} span={4}>
            <Input
              placeholder="请输入编号"
              allowClear={false}
              value={voucher.num}
              onChange={event => updateVoucher({ name: 'num', value: event.target.value })}
            />
          </Col>
        </Row>
        <Row style={{ marginTop: '1rem' }}>
          <Col className={`${styles.border} ${styles.center}`} span={6}>摘要</Col>
          <Col className={`${styles.border} ${styles.center}`} span={6}>标签</Col>
          <Col className={`${styles.border} ${styles.center}`} span={6}>会计科目</Col>
          <Col className={`${styles.border} ${styles.center}`} span={3}>借方金额</Col>
          <Col className={`${styles.border} ${styles.center}`} span={3}>贷方金额</Col>
        </Row>
        {accounts.map(item => (
          <Row key={item.key}>
            {/*摘要*/}
            <Col className={`${styles.border} ${styles.center}`} span={6}>
              <CloseCircleOutlined
                style={{ color: 'red', marginLeft: '.5rem' }}
                onClick={() => deleteAccount(item.key)}
              />
              <Input
                style={{ width: '100%' }}
                bordered={false}
                value={item.summary}
                onChange={event => {
                  const { value } = event.target;
                  updateAccount(item.key, [{ name: 'summary', value }]);
                }}
              />
            </Col>
            {/*标签*/}
            <Col className={`${styles.border} ${styles.center}`} span={6}>
              <Select
                style={{ width: '100%' }}
                bordered={false}
                mode="tags"
                options={labelOptions}
                value={item.labels}
                onChange={value => {
                  updateAccount(item.key, [{ name: 'labels', value }])
                }}
              />
            </Col>
            {/*会计科目*/}
            <Col className={`${styles.border} ${styles.center}`} span={6}>
              <Cascader
                style={{ width: '100%' }}
                bordered={false}
                expandTrigger="hover"
                changeOnSelect={true}
                fieldNames={{ label: 'name', value: 'id' }}
                options={subjectOptions}
                value={item.subjectIds}
                showSearch={{
                  filter: (inputValue, options) => {
                    return options.some((option: any) => option.name.indexOf(inputValue.toLowerCase()) > -1);
                  }
                }}
                onChange={(value: any) => {
                  updateAccount(item.key, [{ name: 'subjectIds', value }]);
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
                  updateAccount(item.key, pairs);
                }}
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
                  updateAccount(item.key, pairs);
                }}
              />
            </Col>
          </Row>
        ))}
        <Row>
          <Col className={`${styles.border} ${styles.center}`} span={24}>
            <Button type="link" onClick={insertAccount} style={{ width: '100%' }}>添加</Button>
          </Col>
        </Row>
        <Row>
          <Col className={`${styles.border} ${styles.center}`} span={12}>合计</Col>
          <Col className={`${styles.border} ${styles.center}`} span={6}>
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
            <Button type="link" onClick={submit}>提交</Button>
          </Col>
        </Row>
      </div>
    </>
  );
};

export default InsertVoucher;