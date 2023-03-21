import React, { useEffect, useState } from "react";
import { PermissionColumn, Role, UserRelRole } from "../../../constants/entity";
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
  onChange?: (value: UserRelRole) => void;
}

const PermissionCascader: React.FC<Props> = ({ selectedRole, onChange }) => {
  const [currentRole, setCurrentRole] = useState<UserRelRole>();
  const [permissionColumns, setPermissionColumns] = useState<
    PermissionColumn[]
  >([]);
  const [levels, setLevels] = useState<Level[]>([]);
  const [permissionGroups, setPermissionGroups] = useState<PermissionGroup[]>(
    []
  );

  // 获取当前用户选择的角色信息
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

  // 获取权限等级数据
  useEffect(() => {
    (async () => {
      let permissionColumns: PermissionColumn[] = [];
      const id = (currentRole || {}).role?.permissionColumn?.id;
      if (id) {
        try {
          const permissionColumn: PermissionColumn = await ajax.get(
            `/permissionColumns/${id}`
          );
          permissionColumns = [permissionColumn];
        } catch (e) {
          permissionColumns = [];
        }
      }
      setPermissionColumns(permissionColumns);
    })();
  }, [currentRole]);

  useEffect(() => {
    if (permissionColumns.length > 0 && selectedRole) {
      const levelValue = selectedRole.permissionColumn?.level;
      const levels = searchPermissions(permissionColumns, levelValue);
      setLevels(levels);
    } else {
      setLevels([]);
    }
  }, [permissionColumns, selectedRole]);

  useEffect(() => {
    if (!currentRole) {
      setPermissionGroups([]);
      return;
    }

    const { permissionColumn = {} } = currentRole.role || {};
    const level = {
      value: permissionColumn.level,
      label: permissionColumn.name,
    };
    const option: Option = {
      value: currentRole.value,
      label: currentRole.label,
      level: level,
    };

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
  }, [currentRole, levels]);

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

function searchPermissions(
  roles: PermissionColumn[],
  levelValue: string | undefined
): Level[] {
  for (let item of roles) {
    const { children, name: label, level: value } = item;
    if (children && children.length > 0) {
      const result = searchPermissions(children, levelValue);
      if (result.length > 0) {
        const level = { value, label };
        return [level, ...result];
      }
    }
    if (value === levelValue) {
      return [{ value, label }];
    }
  }
  return [];
}

export default PermissionCascader;
