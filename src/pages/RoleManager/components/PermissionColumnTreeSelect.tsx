import React, { useEffect, useState } from "react";
import { PermissionColumn } from "../../../constants/entity";
import { TreeSelect } from "antd";
import { OptionType } from "../../../constants/type";
import { getOptionsOfPermissionColumn } from "../../../services/permissionColumnService";

interface Props {
  placeholder?: string;
  filter?: PermissionColumn;
  disabled?: boolean;
  value?: PermissionColumn;
  onChange?: (value: PermissionColumn) => void;
}

const PermissionColumnTreeSelect: React.FC<Props> = (props) => {
  const { placeholder, filter, disabled, value, onChange } = props;

  const [treeData, setTreeData] = useState<OptionType[]>([]);
  const [filterTreeData, setFilterTreeData] = useState<OptionType[]>([]);

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

  useEffect(() => {
    if (filter && filter.id) {
      const search = (options: OptionType[]) => {
        for (let option of options) {
          const { value, children } = option;
          if (children && children.length > 0) {
            const result: OptionType[] = search(children);
            if (result.length > 0) {
              return result;
            }
          }
          if (value === filter.id) {
            return option.children || [];
          }
        }
        return [];
      };
      setFilterTreeData(search(treeData));
    } else {
      setFilterTreeData(treeData);
    }
  }, [filter, treeData]);

  const handleChange = (value: number) => {
    const column: PermissionColumn = { id: value };
    onChange && onChange(column);
  };

  return (
    <TreeSelect
      placeholder={placeholder}
      disabled={disabled}
      treeDefaultExpandAll={true}
      treeData={filterTreeData}
      value={value && value.id}
      onChange={handleChange}
    />
  );
};

export default PermissionColumnTreeSelect;
