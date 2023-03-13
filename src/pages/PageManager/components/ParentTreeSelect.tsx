import React, { useEffect, useState } from "react";
import { PageInfo } from "../../../constants/entity";
import { TreeSelect } from "antd";

interface OptionType {
  value?: number;
  label?: string;
  children?: OptionType[];
}

interface Props {
  dataSource: PageInfo[];
  placeholder?: string;
  value?: PageInfo;
  onChange?: (value: PageInfo) => void;
}

const ParentTreeSelect: React.FC<Props> = (props) => {
  const { dataSource, placeholder, value, onChange } = props;

  const [treeData, setTreeData] = useState<OptionType[]>([]);

  useEffect(() => {
    const filter = (pageInfos: PageInfo[]) => {
      return pageInfos
        .filter((item) => item.type === "VIRTUALITY")
        .map((item) => {
          const option: OptionType = { value: item.id, label: item.name };
          if (item.children && item.children.length > 0) {
            option.children = filter(item.children);
          }
          return option;
        });
    };
    setTreeData(filter(dataSource));
  }, [dataSource]);

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
