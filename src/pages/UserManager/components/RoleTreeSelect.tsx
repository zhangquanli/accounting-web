import React, { useEffect, useState } from "react";
import { Role, User } from "../../../constants/entity";
import { TreeSelect } from "antd";
import { OptionType } from "../../../constants/type";
import ajax from "../../../utils/ajax";

interface Props {
  placeholder?: string;
  value?: Role;
  onChange?: (value: Role) => void;
}

const RoleTreeSelect: React.FC<Props> = ({ placeholder, value, onChange }) => {
  const [roles, setRoles] = useState<Role[]>([]);
  const [treeData, setTreeData] = useState<OptionType[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const user: User = await ajax.get("/authentication/getUserInfo");
        if (user.roles && user.roles.length > 0) {
          // TODO 选择第一个角色；这里正常是用户登录后需要选择他使用的角色
          const role = user.roles[0];
          if (role.role) {
            setRoles([role.role]);
          }
        }
      } catch (e) {
        setRoles([]);
      }
    })();
  }, []);

  useEffect(() => {
    setTreeData(toTree(roles));
  }, [roles]);

  function handleChange(value: number) {
    const role: Role = { id: value };
    onChange && onChange(role);
  }

  return (
    <TreeSelect
      placeholder={placeholder}
      treeDefaultExpandAll={true}
      treeData={treeData}
      onChange={handleChange}
    />
  );
};

function toTree(roles: Role[]): OptionType[] {
  return roles.map((item) => {
    const { id, name, children, permissionColumn } = item;
    const option: OptionType = {
      value: id,
      title: `${name}（${permissionColumn?.name}）`,
    };
    if (children && children.length > 0) {
      option.children = toTree(children);
    }
    return option;
  });
}

export default RoleTreeSelect;
