import React, { useEffect, useState } from "react";
import { Role, User, UserRelRole } from "../../../constants/entity";
import { Select, Space } from "antd";
import ajax from "../../../utils/ajax";

interface Level {
  value?: string;
  label?: string;
}

interface Option {
  value?: string;
  label?: string;
  level?: Level;
}

interface PermissionGroup {
  level: Level;
  options: Option[];
  selected?: Option;
}

interface Props {
  selectedRole?: Role;
  value?: UserRelRole;
  onChange?: (value: UserRelRole) => void;
}

const PermissionCascader: React.FC<Props> = (props) => {
  const { selectedRole, onChange } = props;

  const [current, setCurrent] = useState<UserRelRole | undefined>();
  const [currentRole, setCurrentRole] = useState<Role | undefined>(undefined);
  const [permissionGroups, setPermissionGroups] = useState<PermissionGroup[]>(
    []
  );

  // 获取当前用户的关联角色信息
  useEffect(() => {
    (async () => {
      try {
        const user: User = await ajax.get("/authentication/getUserInfo");
        const { userRelRoles } = user;
        if (userRelRoles && userRelRoles.length > 0) {
          // TODO 选择第一个角色；这里正常是用户登录后需要选择他使用的角色
          const userRelRole = userRelRoles[0];
          setCurrent(userRelRole);

          const role: Role = await ajax.get(`/roles/${userRelRole.role?.id}`);
          setCurrentRole(role);
        } else {
          setCurrent(undefined);
        }
      } catch (e) {
        setCurrent(undefined);
      }
    })();
  }, []);

  useEffect(() => {
    if (current && current.role && selectedRole && currentRole) {
      const { permissionColumn = {} } = current.role;
      const level = {
        value: permissionColumn.level,
        label: permissionColumn.name,
      };
      const option: Option = {
        value: current.value,
        label: current.label,
        level: level,
      };
      const levels = searchPermissions([currentRole], selectedRole.id);
      const groups: PermissionGroup[] = [];
      for (let i = 0; i < levels.length; i++) {
        const item = levels[i];
        const group: PermissionGroup = { level: item, options: [] };
        if (item.value === option.level?.value) {
          group.options = [option];
        }
        groups.push(group);
      }
      setPermissionGroups(groups);
    }
  }, [selectedRole, current]);

  const processPermissionGroups = async (option: any, level: Level) => {
    const index = permissionGroups.findIndex(
      (item) => item.level.value === level.value
    );
    if (index > -1) {
      for (let i = index; i < permissionGroups.length; i++) {
        if (i === index) {
          permissionGroups[i].selected = option;
        } else {
          permissionGroups[i].selected = undefined;
          permissionGroups[i].options = [];
        }
      }
      const group = permissionGroups[index + 1];
      if (group) {
        const params = { level: group.level.value, parentCode: option.value };
        group.options = await ajax.get("/permissionColumns/options", params);
      }
    }
    return permissionGroups;
  };

  const handleChange = async (option: any, level: Level) => {
    const newPermissionGroups = await processPermissionGroups(option, level);
    setPermissionGroups([...newPermissionGroups]);

    // 组装数据
    const length = permissionGroups.length;
    if (length > 0 && permissionGroups[length - 1].selected) {
      const last = permissionGroups[length - 1];
      const user: UserRelRole = {
        value: last.selected?.value,
        label: last.selected?.label,
        fullValue: permissionGroups
          .map((item) => item.selected?.value)
          .join(","),
        fullLabel: permissionGroups
          .map((item) => item.selected?.label)
          .join(","),
      };
      onChange && onChange(user);
    }
  };

  return (
    <Space direction="vertical" style={{ width: "100%" }}>
      {permissionGroups.length > 0
        ? permissionGroups.map((item) => (
            <Select
              key={item.level.value}
              placeholder={`请选择${item.level.label}`}
              options={item.options}
              value={item.selected}
              onChange={(value, option) => handleChange(option, item.level)}
            />
          ))
        : "请先选择角色"}
    </Space>
  );
};

function searchPermissions(roles: Role[], roleId: number | undefined): Level[] {
  for (let item of roles) {
    const { children, permissionColumn } = item;
    if (children && children.length > 0) {
      const result = searchPermissions(children, roleId);
      if (result.length > 0 && permissionColumn) {
        const { level: value, name: label } = permissionColumn;
        const level = { value, label };
        return [level, ...result];
      }
    }
    if (item.id === roleId) {
      if (permissionColumn) {
        const { level: value, name: label } = permissionColumn;
        return [{ value, label }];
      }
    }
  }
  return [];
}

export default PermissionCascader;
