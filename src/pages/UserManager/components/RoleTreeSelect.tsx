import React, { useEffect, useState } from "react";
import { Role } from "../../../constants/entity";
import { TreeSelect } from "antd";
import { OptionType } from "../../../constants/type";
import ajax from "../../../utils/ajax";

interface Props {
  placeholder?: string;
  value?: Role[];
  onChange?: (value: Role[]) => void;
}

const RoleTreeSelect: React.FC<Props> = ({ placeholder, value, onChange }) => {
  const [treeData, setTreeData] = useState<OptionType[]>([]);
  const [checkedKeys, setCheckedKeys] = useState<number[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const roles: Role[] = await ajax.get("/roles");
        const toTree = (roles: Role[]) => {
          return roles.map((item) => {
            const { id, name, children } = item;
            const option: OptionType = { value: id, title: name };
            if (children && children.length > 0) {
              option.children = toTree(children);
            }
            return option;
          });
        };
        setTreeData(toTree(roles));
      } catch (e) {
        setTreeData([]);
      }
    })();
  }, []);

  useEffect(() => {
    const checkedKeys: number[] = [];
    if (value) {
      for (let role of value) {
        role.id && checkedKeys.push(role.id);
      }
    }
    setCheckedKeys(checkedKeys);
  }, [value]);

  const handleChange = (values: number[]) => {
    const roles: Role[] = values.map((item) => ({ id: item }));
    onChange && onChange(roles);
  };

  return (
    <TreeSelect
      treeCheckable={true}
      showCheckedStrategy={TreeSelect.SHOW_PARENT}
      placeholder={placeholder}
      treeData={treeData}
      onChange={handleChange}
      value={checkedKeys}
    />
  );
};

export default RoleTreeSelect;
