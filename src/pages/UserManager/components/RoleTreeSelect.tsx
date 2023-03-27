import React, { useEffect, useState } from "react";
import { ListResult, Role, UserRelRole } from "../../../constants/entity";
import { TreeSelect } from "antd";
import { OptionType } from "../../../constants/type";
import ajax from "../../../utils/ajax";

interface Props {
  placeholder?: string;
  value?: Role;
  onChange?: (value: Role | undefined) => void;
}

const RoleTreeSelect: React.FC<Props> = ({ placeholder, value, onChange }) => {
  const [currentRole, setCurrentRole] = useState<UserRelRole>();
  const [roles, setRoles] = useState<Role[]>([]);
  const [treeData, setTreeData] = useState<OptionType[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const currentRole: UserRelRole = await ajax.get(
          "/authentication/currentRole"
        );
        setCurrentRole(currentRole);
      } catch (e) {
        setCurrentRole(undefined);
      }
    })();
  }, []);

  useEffect(() => {
    if (!currentRole) {
      setRoles([]);
      return;
    }
    (async () => {
      try {
        if (currentRole.role?.permissionColumn?.level === "ALL") {
          const result: ListResult<Role> = await ajax.get("/roles");
          setRoles(result.rows);
        } else {
          const role: Role = await ajax.get(`/roles/${currentRole.role?.id}`);
          setRoles([role]);
        }
      } catch (e) {
        setRoles([]);
      }
    })();
  }, [currentRole]);

  useEffect(() => {
    setTreeData(toTree(roles));
  }, [roles]);

  function handleChange(value: any) {
    const role = search(roles, value);
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

function search(roles: Role[], roleId: number | undefined): Role | undefined {
  for (let role of roles) {
    const { children } = role;
    if (children && children.length > 0) {
      const result = search(children, roleId);
      if (result) {
        return result;
      }
    }
    if (role.id === roleId) {
      return role;
    }
  }
}

export default RoleTreeSelect;
