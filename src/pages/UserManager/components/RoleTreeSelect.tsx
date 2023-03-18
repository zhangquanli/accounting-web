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
  const [currentRole, setCurrentRole] = useState<Role | undefined>(undefined);
  const [treeData, setTreeData] = useState<OptionType[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const user: User = await ajax.get("/authentication/getUserInfo");
        if (user.userRelRoles && user.userRelRoles.length > 0) {
          // TODO 选择第一个角色；这里正常是用户登录后需要选择他使用的角色
          const userRelRole = user.userRelRoles[0];
          // 查询角色数据
          try {
            const newRole: Role = await ajax.get(
              `/roles/${userRelRole.role?.id}`
            );
            setCurrentRole(newRole);
          } catch (e) {
            setCurrentRole(undefined);
          }
        }
      } catch (e) {
        setCurrentRole(undefined);
      }
    })();
  }, []);

  useEffect(() => {
    currentRole && setTreeData(toTree([currentRole]));
  }, [currentRole]);

  function handleChange(value: any, label: any) {
    const role: Role = { id: value, name: label[0] };
    onChange && onChange(role);
  }

  return (
    <TreeSelect
      placeholder={placeholder}
      treeLine={true}
      treeDefaultExpandAll={true}
      treeData={treeData}
      value={value?.id}
      onChange={handleChange}
    />
  );
};

function toTree(roles: Role[]): OptionType[] {
  return roles.map((item) => {
    const { id, name, children } = item;
    const option: OptionType = {
      value: id,
      title: name,
    };
    if (children && children.length > 0) {
      option.children = toTree(children);
    }
    return option;
  });
}

export default RoleTreeSelect;
