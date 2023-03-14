import React, { useEffect, useState } from "react";
import {
  ComponentInfo,
  DisplayColumn,
  PageInfo,
  RoleRelComponentInfo,
  RoleRelDisplayColumn,
  RoleRelPageInfo,
} from "../../../constants/entity";
import ajax from "../../../utils/ajax";
import { Tree } from "antd";
import styles from "./PageTree.module.scss";

const column2tree = (columns: DisplayColumn[]) => {
  return columns.map((item) => {
    const { id, name } = item;
    return { title: `展示字段-${name}`, key: `column-${id}` };
  });
};

const component2tree = (components: ComponentInfo[]) => {
  return components.map((item) => {
    const { id, name, displayColumns } = item;
    if (displayColumns && displayColumns.length > 0) {
      const children = column2tree(displayColumns);
      return { title: `组件-${name}`, key: `component-${id}`, children };
    } else {
      return { title: `组件-${name}`, key: `component-${id}` };
    }
  });
};

const page2tree: any = (pages: PageInfo[]) => {
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
};

interface Checked {
  pageInfos: RoleRelPageInfo[];
  componentInfos: RoleRelComponentInfo[];
  displayColumns: RoleRelDisplayColumn[];
}

interface Props {
  value?: Checked;
  onChange?: (value: Checked) => void;
}

const PageTree: React.FC<Props> = ({ value, onChange }) => {
  const [treeData, setTreeData] = useState<any[]>([]);
  const [checkedKeys, setCheckedKeys] = useState<{
    checked: string[];
    halfChecked: string[];
  }>({ checked: [], halfChecked: [] });

  useEffect(() => {
    if (value) {
      const { pageInfos, componentInfos, displayColumns } = value;
      const pagesAll: any[] = (pageInfos || [])
        .filter((item) => item.checkedType === "ALL")
        .map((item) => `page-${item.pageInfo?.id}`);
      const componentsAll: any[] = (componentInfos || [])
        .filter((item) => item.checkedType === "ALL")
        .map((item) => `component-${item.componentInfo?.id}`);
      const columnsAll: any[] = (displayColumns || [])
        .filter((item) => item.checkedType === "ALL")
        .map((item) => `column-${item.displayColumn?.id}`);

      const pagesHalf: any[] = (pageInfos || [])
        .filter((item) => item.checkedType === "HALF")
        .map((item) => `page-${item.pageInfo?.id}`);
      const componentsHalf: any[] = (componentInfos || [])
        .filter((item) => item.checkedType === "HALF")
        .map((item) => `component-${item.componentInfo?.id}`);
      const columnsHalf: any[] = (displayColumns || [])
        .filter((item) => item.checkedType === "HALF")
        .map((item) => `column-${item.displayColumn?.id}`);

      const checkedKeys = {
        checked: [...pagesAll, ...componentsAll, ...columnsAll],
        halfChecked: [...pagesHalf, ...componentsHalf, ...columnsHalf],
      };
      setCheckedKeys(checkedKeys);
    }
  }, [value]);

  useEffect(() => {
    (async () => {
      const data: PageInfo[] = await ajax.get("/pageInfos");
      const treeData = page2tree(data);
      setTreeData(treeData);
    })();
  }, []);

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
    const pageInfos = checkedPages(checked, info.halfCheckedKeys);
    // 关联的组件
    const componentInfos = checkedComponents(checked, info.halfCheckedKeys);
    // 关联的展示字段
    const displayColumns = checkedDisplayColumns(checked, info.halfCheckedKeys);

    console.log(pageInfos);
    console.log(componentInfos);
    console.log(displayColumns);
    // 保存
    onChange && onChange({ pageInfos, componentInfos, displayColumns });
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

export default PageTree;
