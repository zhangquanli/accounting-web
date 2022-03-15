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

export function searchTreeIds(tree: any[], idKey: string, childrenKey: string, id: number) {
  const deepSearch = (tree: any[], id: number, ids: any[]) => {
    if (tree && tree.length > 0) {
      for (let item of tree) {
        ids.push(item[idKey]);
        if (item[childrenKey] && item[childrenKey].length > 0) {
          deepSearch(item[childrenKey], id, ids);
          if (ids.includes(id)) {
            break;
          }
        }
        if (item[idKey] === id) {
          break;
        } else {
          ids.pop();
        }
      }
    }
  }
  const ids: any[] = [];
  deepSearch(tree, id, ids);
  return ids;
}