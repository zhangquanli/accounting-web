import { PermissionColumn } from "../constants/entity";
import ajax from "../utils/ajax";
import { OptionType } from "../constants/type";

export const getOptionsOfPermissionColumn = async () => {
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
  return toTree(columns);
};
