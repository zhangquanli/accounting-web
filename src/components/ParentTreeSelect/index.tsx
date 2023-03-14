import React from "react";
import { TreeSelect } from "antd";
import { BaseEntity } from "../../constants/entity";
import { OptionType } from "../../constants/type";

interface Props {
  treeData: OptionType[];
  placeholder?: string;
  value?: BaseEntity;
  onChange?: (value: BaseEntity) => void;
}

const ParentTreeSelect: React.FC<Props> = (props) => {
  const { treeData, placeholder, value, onChange } = props;

  const handleChange = (value: number) => {
    onChange && onChange({ id: value });
  };

  return (
    <TreeSelect
      showSearch={true}
      placeholder={placeholder}
      treeData={treeData}
      value={value && value.id}
      onChange={handleChange}
    />
  );
};

export default ParentTreeSelect;
