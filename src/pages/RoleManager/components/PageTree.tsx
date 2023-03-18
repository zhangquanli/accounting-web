import React, { useEffect, useState } from "react";
import {
  ComponentInfo,
  DisplayColumn,
  PageInfo,
  PermissionColumn,
  RoleRelComponentInfo,
  RoleRelDisplayColumn,
  RoleRelPageInfo,
} from "../../../constants/entity";
import ajax from "../../../utils/ajax";
import { Tree } from "antd";
import styles from "./PageTree.module.scss";

interface OptionType {
  title: string;
  key: string;
  children?: OptionType[];
}

interface PageChecked {
  roleRelPageInfos: RoleRelPageInfo[];
  roleRelComponentInfos: RoleRelComponentInfo[];
  roleRelDisplayColumns: RoleRelDisplayColumn[];
}

interface Props {
  filter?: PermissionColumn;
  value?: PageChecked;
  onChange?: (value: PageChecked) => void;
}

interface CheckedKeys {
  checked: string[];
  halfChecked: string[];
}

const PageTree: React.FC<Props> = ({ filter, value, onChange }) => {
  const [pageInfos, setPageInfos] = useState<PageInfo[]>([]);
  const [permissions, setPermissions] = useState<PermissionColumn[]>([]);
  const [treeData, setTreeData] = useState<OptionType[]>([]);
  const [checkedKeys, setCheckedKeys] = useState<CheckedKeys>({
    checked: [],
    halfChecked: [],
  });

  useEffect(() => {
    (async () => {
      try {
        const data: PageInfo[] = await ajax.get("/pageInfos/selectTree");
        setPageInfos(data);
      } catch (e) {
        setPageInfos([]);
      }
    })();
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const columns: PermissionColumn[] = await ajax.get(
          "/permissionColumns"
        );
        setPermissions(columns);
      } catch (e) {
        setPermissions([]);
      }
    })();
  }, []);

  useEffect(() => {
    if (filter && filter.id) {
      const validateColumn = searchPermission(permissions, filter.id);
      if (!validateColumn) {
        setTreeData(page2tree(pageInfos));
        return;
      }
      const pages = filterPages(pageInfos, validateColumn);
      setTreeData(page2tree(pages));
    } else {
      setTreeData(page2tree(pageInfos));
    }
  }, [filter, permissions, pageInfos]);

  useEffect(() => {
    if (value) {
      const { roleRelPageInfos } = value;
      const { roleRelComponentInfos } = value;
      const { roleRelDisplayColumns } = value;
      const pagesAll: any[] = (roleRelPageInfos || [])
        .filter((item) => item.checkedType === "ALL")
        .map((item) => `page-${item.pageInfo?.id}`);
      const componentsAll: any[] = (roleRelComponentInfos || [])
        .filter((item) => item.checkedType === "ALL")
        .map((item) => `component-${item.componentInfo?.id}`);
      const columnsAll: any[] = (roleRelDisplayColumns || [])
        .filter((item) => item.checkedType === "ALL")
        .map((item) => `column-${item.displayColumn?.id}`);

      const pagesHalf: any[] = (roleRelPageInfos || [])
        .filter((item) => item.checkedType === "HALF")
        .map((item) => `page-${item.pageInfo?.id}`);
      const componentsHalf: any[] = (roleRelComponentInfos || [])
        .filter((item) => item.checkedType === "HALF")
        .map((item) => `component-${item.componentInfo?.id}`);
      const columnsHalf: any[] = (roleRelDisplayColumns || [])
        .filter((item) => item.checkedType === "HALF")
        .map((item) => `column-${item.displayColumn?.id}`);

      const checkedKeys = {
        checked: [...pagesAll, ...componentsAll, ...columnsAll],
        halfChecked: [...pagesHalf, ...componentsHalf, ...columnsHalf],
      };
      setCheckedKeys(checkedKeys);
    }
  }, [value]);

  const checkedPages = (checked: any[], halfChecked: any[]) => {
    const pagesAll: RoleRelPageInfo[] = (checked || [])
      .filter((item: string) => item.includes("page-"))
      .map((item: string) => {
        const id = item.substring("page-".length);
        return { pageInfo: { id: parseInt(id) }, checkedType: "ALL" };
      });
    const pagesHalf: RoleRelPageInfo[] = (halfChecked || [])
      .filter((item: string) => item.includes("page-"))
      .map((item: string) => {
        const id = item.substring("page-".length);
        return { pageInfo: { id: parseInt(id) }, checkedType: "HALF" };
      });
    return [...pagesAll, ...pagesHalf];
  };

  const checkedComponents = (checked: any[], halfChecked: any[]) => {
    const pagesAll: RoleRelComponentInfo[] = (checked || [])
      .filter((item: string) => item.includes("component-"))
      .map((item: string) => {
        const id = item.substring("component-".length);
        return { componentInfo: { id: parseInt(id) }, checkedType: "ALL" };
      });
    const pagesHalf: RoleRelComponentInfo[] = (halfChecked || [])
      .filter((item: string) => item.includes("component-"))
      .map((item: string) => {
        const id = item.substring("component-".length);
        return { componentInfo: { id: parseInt(id) }, checkedType: "HALF" };
      });
    return [...pagesAll, ...pagesHalf];
  };

  const checkedDisplayColumns = (checked: any[], halfChecked: any[]) => {
    const pagesAll: RoleRelDisplayColumn[] = (checked || [])
      .filter((item: string) => item.includes("column-"))
      .map((item: string) => {
        const id = item.substring("column-".length);
        return { displayColumn: { id: parseInt(id) }, checkedType: "ALL" };
      });
    const pagesHalf: RoleRelDisplayColumn[] = (halfChecked || [])
      .filter((item: string) => item.includes("column-"))
      .map((item: string) => {
        const id = item.substring("column-".length);
        return { displayColumn: { id: parseInt(id) }, checkedType: "HALF" };
      });
    return [...pagesAll, ...pagesHalf];
  };

  const handleChange = (checked: any, info: any) => {
    // 关联的页面
    const roleRelPageInfos = checkedPages(checked, info.halfCheckedKeys);
    // 关联的组件
    const roleRelComponentInfos = checkedComponents(
      checked,
      info.halfCheckedKeys
    );
    // 关联的展示字段
    const roleRelDisplayColumns = checkedDisplayColumns(
      checked,
      info.halfCheckedKeys
    );
    // 保存
    onChange &&
      onChange({
        roleRelPageInfos,
        roleRelComponentInfos,
        roleRelDisplayColumns,
      });
  };

  return (
    <Tree
      className={styles.tree}
      checkable={true}
      selectable={false}
      treeData={treeData}
      checkedKeys={checkedKeys}
      onCheck={handleChange}
    />
  );
};

function column2tree(columns: DisplayColumn[]): OptionType[] {
  return columns.map((item) => {
    const { id, name } = item;
    return { title: `展示字段-${name}`, key: `column-${id}` };
  });
}

function component2tree(components: ComponentInfo[]): OptionType[] {
  return components.map((item) => {
    const { id, name, displayColumns } = item;
    if (displayColumns && displayColumns.length > 0) {
      const children = column2tree(displayColumns);
      return { title: `组件-${name}`, key: `component-${id}`, children };
    } else {
      return { title: `组件-${name}`, key: `component-${id}` };
    }
  });
}

function page2tree(pages: PageInfo[]): OptionType[] {
  return pages.map((item) => {
    const { id, name, type, children, componentInfos } = item;
    if (type === "REALITY") {
      if (componentInfos && componentInfos.length > 0) {
        const newChildren = component2tree(componentInfos);
        return {
          title: `页面-${name}`,
          key: `page-${id}`,
          children: newChildren,
        };
      } else {
        return { title: `页面-${name}`, key: `page-${id}` };
      }
    } else {
      if (children && children.length > 0) {
        const newChildren = page2tree(children);
        return {
          title: `页面-${name}`,
          key: `page-${id}`,
          children: newChildren,
        };
      } else {
        return { title: `页面-${name}`, key: `page-${id}` };
      }
    }
  });
}

function searchPermission(
  columns: PermissionColumn[],
  id: number
): PermissionColumn | undefined {
  let result: PermissionColumn | undefined = undefined;
  for (const column of columns) {
    const { children } = column;
    if (children && children.length > 0) {
      result = searchPermission(children, id);
      if (result) {
        break;
      }
    }
    if (column.id === id) {
      result = column;
      break;
    }
  }
  return result;
}

function filterPages(
  pages: PageInfo[],
  validateColumn: PermissionColumn
): PageInfo[] {
  const result: PageInfo[] = [];
  for (const page of pages) {
    const { children, permissionColumns } = page;

    let newChildren: PageInfo[] = [];
    if (children && children.length > 0) {
      newChildren = filterPages(children, validateColumn);
    }

    if (page.type === "REALITY") {
      let flag = false;
      if (permissionColumns && permissionColumns.length > 0) {
        for (const permissionColumn of permissionColumns) {
          flag = containsPermission([validateColumn], permissionColumn.id);
          if (flag) {
            break;
          }
        }
      }
      if (flag) {
        result.push({ ...page, children: newChildren });
      }
    } else if (page.type === "VIRTUALITY") {
      if (newChildren.length > 0) {
        result.push({ ...page, children: newChildren });
      }
    }
  }
  return result;
}

function containsPermission(
  columns: PermissionColumn[],
  id: number | undefined
): boolean {
  let result = false;
  for (const column of columns) {
    const { children } = column;
    if (children && children.length > 0) {
      result = containsPermission(children, id);
      if (result) {
        break;
      }
    }
    if (column.id === id) {
      result = true;
      break;
    }
  }
  return result;
}

export default PageTree;
