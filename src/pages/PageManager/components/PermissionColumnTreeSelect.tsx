import React, { useEffect, useState } from "react";
import { PermissionColumn } from "../../../constants/entity";
import { TreeSelect } from "antd";
import { OptionType } from "../../../constants/type";
import ajax from "../../../utils/ajax";

interface Props {
  placeholder?: string;
  value?: PermissionColumn[];
  onChange?: (value: PermissionColumn[]) => void;
}

const PermissionColumnTreeSelect: React.FC<Props> = (props) => {
  const { placeholder, value, onChange } = props;

  const [treeData, setTreeData] = useState<OptionType[]>([]);

  useEffect(() => {
    (async () => {
      const columns: PermissionColumn[] = await ajax.get("/permissionColumns");
      const toTree = (columns: PermissionColumn[]) => {
        return columns.map((column) => {
          const { id, name, children } = column;
          const option: OptionType = { value: id, title: name };
          if (children && children.length > 0) {
            option.children = toTree(children);
          }
          return option;
        });
      };
      setTreeData(toTree(columns));
    })();
  }, []);

  const handleChange = (optionTypes: OptionType[]) => {
    const columns = optionTypes.map((item) => ({
      id: item.value,
      name: item.label,
    }));
    onChange && onChange(columns);
  };

  return (
    <TreeSelect
      treeCheckable={true}
      treeCheckStrictly={true}
      showCheckedStrategy={TreeSelect.SHOW_ALL}
      treeDefaultExpandAll={true}
      placeholder={placeholder}
      treeData={treeData}
      value={
        value && value.map((item) => ({ value: item.id, label: item.name }))
      }
      onChange={handleChange}
    />
  );
};

export default PermissionColumnTreeSelect;
