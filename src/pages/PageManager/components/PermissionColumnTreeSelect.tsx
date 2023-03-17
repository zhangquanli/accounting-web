import React, { useEffect, useState } from "react";
import { PermissionColumn } from "../../../constants/entity";
import { TreeSelect } from "antd";
import { OptionType } from "../../../constants/type";
import { getOptionsOfPermissionColumn } from "../../../services/permissionColumnService";

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
      try {
        const options = await getOptionsOfPermissionColumn();
        setTreeData(options);
      } catch (e) {
        setTreeData([]);
      }
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
