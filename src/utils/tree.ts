export function array2Tree(array: any[], idKey: string, parentIdKey: string) {
  const groups: any = {};
  for (let item of array) {
    const parentKey = item[parentIdKey];
    if (Object.keys(groups).includes(parentKey)) {
      groups[parentKey].push(item);
    } else {
      groups[parentKey] = [item];
    }
  }
  const fillTree: any = (parentId: string, groups: any) => {
    const result: any[] = groups[parentId];
    if (!result || result.length < 1) {
      return null;
    }
    return result.map(item => {
      const children = fillTree(item[idKey], groups);
      return { ...item, children };
    });
  }
  return fillTree('0', groups);
}

export function searchTreeProps(tree: any[], fieldNames: { id: string, children: string, prop: string }, id: number) {
  const props: any[] = [];
  const deepSearch = (tree: any[], id: number, props: any[]) => {
    if (tree && tree.length > 0) {
      for (let item of tree) {
        const currentId = item[fieldNames.id];
        const children = item[fieldNames.children];
        const prop = item[fieldNames.prop];
        props.push(prop);
        if (currentId === id) {
          return true;
        } else {
          const flag = deepSearch(children, id, props);
          if (!flag) {
            props.pop();
          }
        }
      }
    }
  }
  deepSearch(tree, id, props);
  return props;
}