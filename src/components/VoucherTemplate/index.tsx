import React, { FC, useEffect, useState } from 'react';
import { Button, Cascader, Col, DatePicker, Input, InputNumber, message, Row, Select } from "antd";
import styles from './index.module.scss';
import { nanoid } from "@reduxjs/toolkit";
import { CloseCircleOutlined } from "@ant-design/icons";
import { capitalAmount } from "../../utils/money";
import { deleteVoucher, getVoucher, insertVoucher } from "../../services/voucherAPI";
import { selectLabels } from "../../services/labelAPI";
import moment, { Moment } from "moment";
import { selectSubjectBalances } from "../../services/subjectBalanceAPI";
import { useAppSelector } from "../../app/hooks";

interface AccountingEntry {
  key: string;
  summary?: string;
  type?: 'DEBIT' | 'CREDIT';
  amount?: number;
  subjectIds?: number[];
  labels?: string[];
}

interface Voucher {
  id?: number;
  num?: string;
  accountDate?: Moment;
  accountingEntries: AccountingEntry[];
  invalidVoucher?: Voucher;
  originalVoucher?: Voucher;
}

const initialVoucher: Voucher = {
  accountDate: moment(),
  accountingEntries: [
    { key: nanoid() },
    { key: nanoid() },
  ]
};

interface Props {
  voucherId?: number;
  onSave?: () => void;
  onInvalid?: () => void;
}

const VoucherTemplate: FC<Props> = ({ voucherId, onSave, onInvalid }) => {

  // 激活的账簿
  const activeAccountId = useAppSelector(state => state.userInfo.activeAccountId);

  // 标签数据
  const [labelOptions, setLabelOptions] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      const data = await selectLabels();
      const options = data.map((item: any) => {
        const { name, value, mark } = item;
        return { value: mark, label: mark, labelName: name, labelValue: value };
      });
      setLabelOptions(options);
    })();
  }, []);


  // 科目余额数据
  const [subjectBalanceOptions, setSubjectBalanceOptions] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      if (activeAccountId) {
        const subjectBalances = await selectSubjectBalances(activeAccountId);
        const subjectGroups: any = {};
        for (let subjectBalance of subjectBalances) {
          const { subject } = subjectBalance;
          if (Object.keys(subjectGroups).includes(subject.parentNum)) {
            subjectGroups[subject.parentNum].push(subjectBalance);
          } else {
            subjectGroups[subject.parentNum] = [subjectBalance];
          }
        }
        const fillTree: any = (parentNum: string, subjectGroups: any) => {
          const result: any[] = subjectGroups[parentNum];
          if (!result || result.length < 1) return null;
          return result.map(item => {
            const { subject } = item;
            const children = fillTree(item.subject.num, subjectGroups);
            return { ...item, children, id: subject.id, name: subject.name };
          });
        }
        const data = fillTree('0', subjectGroups);
        setSubjectBalanceOptions(data);
      }
    })();
  }, [activeAccountId]);


  // 记账凭证数据
  const [voucher, setVoucher] = useState<Voucher>(initialVoucher);

  useEffect(() => {
    const deepSearch = (options: any[], id: number, ids: any[]) => {
      if (options && options.length > 0) {
        for (let option of options) {
          ids.push(option.subject.id);
          if (option.children && option.children.length > 0) {
            deepSearch(option.children, id, ids);
            if (ids.includes(id)) {
              break;
            }
          }
          if (option.subject.id === id) {
            break;
          } else {
            ids.pop();
          }
        }
      }
    }
    const getFullIds = (options: any[], id: number) => {
      const ids: any[] = [];
      deepSearch(options, id, ids);
      return ids;
    };
    (async () => {
      if (voucherId) {
        // 加载详情数据
        const data = await getVoucher(voucherId);
        const { id, num, accountDate, accountingEntries, invalidVoucher, originalVoucher } = data;
        const newAccountingEntries = accountingEntries.map((accountEntry: any) => {
          const { id, summary, type, amount, labels, subjectBalance } = accountEntry;
          const subjectIds = getFullIds(subjectBalanceOptions, subjectBalance.subject.id);
          return {
            key: id,
            summary, type, amount, subjectIds,
            labels: labels.map((label: any) => label.mark),
          };
        });
        setVoucher({
          id, num, invalidVoucher, originalVoucher,
          accountDate: moment(accountDate),
          accountingEntries: newAccountingEntries,
        });
      } else {
        setVoucher(initialVoucher);
      }
    })();
  }, [voucherId, subjectBalanceOptions]);

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

  // 借贷金额
  const moneyAmount = (type: 'DEBIT' | 'CREDIT') => {
    const amount = voucher.accountingEntries.filter(item => item.type === type)
      .map(item => item.amount)
      .reduce((prev, current) => {
        return (prev ? prev : 0) + (current ? current : 0);
      }, 0);
    return amount ? amount : undefined;
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
      const { amount, subjectIds } = item;
      return amount && amount > 0 && subjectIds && subjectIds.length > 0;
    }).map(item => {
      const { amount, type, summary, subjectIds, labels } = item;
      const newLabels = labels && labels.map((mark: string) => ({ mark }));
      return {
        amount, type, summary,
        labels: newLabels,
        subjectBalance: {
          id: subjectIds && subjectIds[subjectIds.length - 1],
          subject: {
            id: subjectIds && subjectIds[subjectIds.length - 1],
          },
        },
      };
    });
    const data = {
      num, accountingEntries: newAccountingEntries,
      accountDate: accountDate?.format('YYYY-MM-DD'),
      account: { id: activeAccountId },
    };
    await insertVoucher(data);
    message.success('保存成功');
    onSave && onSave();
  };

  // 冲红凭证
  const invalidVoucher = async (voucherId: number | undefined) => {
    if (voucherId) {
      await deleteVoucher(voucherId);
      message.success('冲红成功');
      onInvalid && onInvalid();
    }
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
        <Col className={`${styles.border} ${styles.center}`} span={8}>标签</Col>
        <Col className={`${styles.border} ${styles.center}`} span={8}>会计科目</Col>
        <Col className={`${styles.border} ${styles.center}`} span={2}>借方金额</Col>
        <Col className={`${styles.border} ${styles.center}`} span={2}>贷方金额</Col>
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
          <Col className={`${styles.border} ${styles.center}`} span={8}>
            <Select
              style={{ width: '100%' }}
              bordered={false}
              mode="tags"
              options={labelOptions}
              value={item.labels}
              onChange={(value) => {
                updateAccountEntry(item.key, [{ name: 'labels', value }])
              }}
              onSelect={(value: any) => {
                if (!value.includes('-')) {
                  const newLabels = item.labels ? [...item.labels] : [];
                  updateAccountEntry(item.key, [{ name: 'labels', value: newLabels }]);
                  message.destroy();
                  message.error('输入的标签必须以\'-\'分割').then(undefined);
                  return;
                }
                if (item.labels && item.labels.length > 0) {
                  const newLabels = item.labels.filter(mark =>
                    (mark.split('-')[0]) !== (value.split('-')[0]));
                  newLabels.push(value);
                  updateAccountEntry(item.key, [{ name: 'labels', value: newLabels }]);
                  message.destroy();
                  message.info('同类型标签选中后，自动切换').then(undefined);
                }
              }}
              disabled={voucherId !== undefined}
            />
          </Col>
          {/*会计科目*/}
          <Col className={`${styles.border} ${styles.center}`} span={8}>
            <Cascader
              style={{ width: '100%' }}
              bordered={false}
              expandTrigger="hover"
              changeOnSelect={true}
              fieldNames={{ label: 'name', value: 'id' }}
              options={subjectBalanceOptions}
              value={item.subjectIds}
              showSearch={{
                filter: (inputValue, options) => {
                  return options.some((option: any) => option.name.indexOf(inputValue.toLowerCase()) > -1);
                }
              }}
              onChange={(value: any) => {
                updateAccountEntry(item.key, [{ name: 'subjectIds', value }]);
              }}
              disabled={voucherId !== undefined}
              displayRender={(nodes, selectedOptions: any) => {
                return selectedOptions.map((option: any, index: number) => {
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
          <Col className={`${styles.border} ${styles.center}`} span={2}>
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
          <Col className={`${styles.border} ${styles.center}`} span={2}>
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
        <Col className={`${styles.border} ${styles.center}`} span={12}>合计</Col>
        <Col className={`${styles.border} ${styles.center}`} span={8}>
          {(debitAmount && creditAmount && debitAmount === creditAmount) ? (
            <div style={{ color: "green" }}>{capitalAmount(Math.abs(debitAmount))}</div>
          ) : (
            <div style={{ color: "red" }}>借贷不平</div>
          )}
        </Col>
        <Col className={`${styles.border} ${styles.center}`} span={2}>
          <InputNumber
            style={{ width: '100%' }}
            bordered={false}
            disabled={true}
            value={debitAmount}
          />
        </Col>
        <Col className={`${styles.border} ${styles.center}`} span={2}>
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
          {/*新增凭证时，显示保存按钮*/}
          {!voucher.id ? (<Button type="link" onClick={saveVoucher}>保存</Button>) : null}
          {/*查看凭证时，显示冲红按钮*/}
          {(voucher.id && !(voucher.invalidVoucher || voucher.originalVoucher)) ? (
            <Button type="link" danger={true} onClick={() => invalidVoucher(voucherId)}>冲红</Button>
          ) : null}
        </Col>
      </Row>
    </div>
  );
};

export default VoucherTemplate;