export interface ModalInfo {
  title: string;
  visible: boolean;
}

export interface ApiInfo {
  id?: number;
  name?: string;
  url?: string;
  httpMethod?: string;
}

export interface DisplayColumn {
  id?: number | string;
  name?: string;
  code?: string;
  num?: string;
}

export interface ComponentInfo {
  id?: number;
  name?: string;
  code?: string;
  num?: string;
  apiInfos?: ApiInfo[];
  displayColumns?: DisplayColumn[];
}

export interface PageInfo {
  id?: number;
  name?: string;
  code?: string;
  type?: string;
  url?: string;
  apiInfos?: ApiInfo[];
  componentInfos?: ComponentInfo[];
  children?: PageInfo[];
  parent?: PageInfo;
}

export interface Role {
  id?: number;
  name?: string;
  children?: Role[];
  parent?: Role;
}
