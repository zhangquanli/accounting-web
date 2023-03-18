import React, { useEffect, useState } from "react";
import { Role, User, UserRelRole } from "../../../constants/entity";
import { Cascader } from "antd";
import ajax from "../../../utils/ajax";

interface Option {
  value?: string | number | null;
  label: React.ReactNode;
  level?: string;
  children?: Option[];
  isLeaf?: boolean;
  loading?: boolean;
}

interface Props {
  role?: Role;
  placeholder?: string;
  value?: UserRelRole;
  onChange?: (value: UserRelRole) => void;
}

const PermissionCascader: React.FC<Props> = (props) => {
  const { role, placeholder, value, onChange } = props;

  const [currentRole, setCurrentRole] = useState<UserRelRole | undefined>(
    undefined
  );
  const [options, setOptions] = useState<Option[]>([]);
  const [levels, setLevels] = useState<string[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const user: User = await ajax.get("/authentication/getUserInfo");
        if (user.roles && user.roles.length > 0) {
          // TODO 选择第一个角色；这里正常是用户登录后需要选择他使用的角色
          const role = user.roles[0];
          if (role.role) {
            setCurrentRole(role);
          }
        }
      } catch (e) {
        setCurrentRole(undefined);
      }
    })();
  }, []);

  useEffect(() => {
    if (role && currentRole) {
      if (currentRole.role) {
        const levels = search([currentRole.role], role.id);
        setLevels(levels);
      }
    }
  }, [role, currentRole]);

  useEffect(() => {
    if (currentRole && currentRole.role && role) {
      const levels = search([currentRole.role], role.id);
      setLevels(levels);

      const { value, label, role: newRole } = currentRole;
      const option: Option = {
        value,
        label,
        level: newRole?.permissionColumn?.level,
        isLeaf: levels.length <= 1,
      };
      setOptions([option]);
    }
  }, [role, currentRole]);

  async function loadData(selectedOptions: Option[]) {
    const targetOption = selectedOptions[selectedOptions.length - 1];
    targetOption.loading = true;

    const current = levels.findIndex((item) => item === targetOption.level);
    if (current > -1 && current < levels.length - 2) {
      const level = levels[current + 1];
      const params = { level, parentCode: targetOption.value };
      const data: Option[] = await ajax.get(
        "/permissionColumns/options",
        params
      );
      targetOption.children = data.map((item) => ({ ...item, isLeaf: false }));
      targetOption.loading = false;
      setOptions([...options]);
    } else if (current < levels.length - 1) {
      const level = levels[current + 1];
      const params = { level, parentCode: targetOption.value };
      targetOption.children = await ajax.get(
        "/permissionColumns/options",
        params
      );
      targetOption.loading = false;
      setOptions([...options]);
    }
  }

  function handleChange(value: any, selectedOptions: any) {
    console.log("v", value, selectedOptions);
  }

  return (
    <Cascader
      placeholder={placeholder}
      options={options}
      changeOnSelect={true}
      loadData={loadData}
      onChange={handleChange}
    />
  );
};

const search = (roles: Role[], roleId: number | undefined): string[] => {
  for (let item of roles) {
    const { children } = item;
    if (children && children.length > 0) {
      const result = search(children, roleId);
      if (
        result.length > 0 &&
        item.permissionColumn &&
        item.permissionColumn.level
      ) {
        return [item.permissionColumn.level, ...result];
      }
    }
    if (item.id === roleId) {
      if (item.permissionColumn && item.permissionColumn.level) {
        return [item.permissionColumn.level];
      }
    }
  }
  return [];
};

export default PermissionCascader;
