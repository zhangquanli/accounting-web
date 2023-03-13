import React, { useEffect, useState } from "react";
import { Button, Input, Space, Tag } from "antd";
import { DisplayColumn } from "../../../constants/entity";
import styles from "./index.module.scss";
import { nanoid } from "@reduxjs/toolkit";

interface Props {
  value?: DisplayColumn[];
  onChange?: (value: DisplayColumn[]) => void;
}

const DisplayColumnInput: React.FC<Props> = ({ value, onChange }) => {
  const [displayColumn, setDisplayColumn] = useState<DisplayColumn>({});
  const [displayColumns, setDisplayColumns] = useState<DisplayColumn[]>([]);

  useEffect(() => {
    value && setDisplayColumns(value);
  }, [value]);

  const handleChange = (name: string, value: string) => {
    setDisplayColumn({ ...displayColumn, [name]: value });
  };

  const insertColumn = () => {
    const newColumn = { ...displayColumn, num: nanoid() };
    const newColumns = [...displayColumns, newColumn];
    setDisplayColumn({});
    setDisplayColumns(newColumns);
    onChange && onChange(newColumns);
  };

  const deleteColumn = (column: DisplayColumn) => {
    const newColumns = displayColumns.filter((item) => item.num !== column.num);
    setDisplayColumns(newColumns);
    onChange && onChange(newColumns);
  };

  return (
    <div>
      <div>
        {displayColumns.map((item) => (
          <Tag
            key={item.num}
            className={styles.tag}
            color="green"
            closable={true}
            onClose={() => deleteColumn(item)}
          >
            {item.name}
          </Tag>
        ))}
      </div>
      <div>
        <Input
          hidden={true}
          value={displayColumn.id}
          onChange={(e) => handleChange("id", e.target.value)}
        />
        <Input
          hidden={true}
          value={displayColumn.num}
          onChange={(e) => handleChange("num", e.target.value)}
        />
        <Space>
          <Input
            addonBefore="字段名称"
            value={displayColumn.name}
            onChange={(e) => handleChange("name", e.target.value)}
          />
          <Input
            addonBefore="字段代码"
            value={displayColumn.code}
            onChange={(e) => handleChange("code", e.target.value)}
          />
          <Button
            type="primary"
            htmlType="submit"
            disabled={!displayColumn.name || !displayColumn.code}
            onClick={insertColumn}
          >
            新增
          </Button>
        </Space>
      </div>
    </div>
  );
};

export default DisplayColumnInput;
