export interface BaseEntity {
  id?: number;
}

export interface PageResult<T> {
  content: T[];
  totalElements: number;
}

export interface ApiInfo extends BaseEntity {
  name?: string;
  url?: string;
  httpMethod?: "GET" | "POST" | "PUT" | "DELETE";
}

export interface DisplayColumn extends BaseEntity {
  name?: string;
  code?: string;
  num?: string;
}

export interface PermissionColumn extends BaseEntity {
  name?: string;
  level?: string;
  children?: PermissionColumn[];
  parent?: PermissionColumn;
}

export interface ComponentInfo extends BaseEntity {
  name?: string;
  code?: string;
  num?: string;
  apiInfos?: ApiInfo[];
  displayColumns?: DisplayColumn[];
}

export interface PageInfo extends BaseEntity {
  name?: string;
  code?: string;
  type?: "VIRTUALITY" | "REALITY";
  url?: string;
  apiInfos?: ApiInfo[];
  componentInfos?: ComponentInfo[];
  permissionColumns?: PermissionColumn[];
  children?: PageInfo[];
  parent?: PageInfo;
}

export interface Role extends BaseEntity {
  name?: string;
  code?: string;
  permissionColumn?: PermissionColumn;
  pageInfos?: PageInfo[];
  componentInfos?: ComponentInfo[];
  displayColumns?: DisplayColumn[];
  children?: Role[];
  parent?: Role;
}

type CheckedType = "ALL" | "HALF";

export interface RoleRelPageInfo extends BaseEntity {
  checkedType?: CheckedType;
  role?: Role;
  pageInfo?: PageInfo;
}

export interface RoleRelComponentInfo extends BaseEntity {
  checkedType?: CheckedType;
  role?: Role;
  componentInfo?: ComponentInfo;
}

export interface RoleRelDisplayColumn extends BaseEntity {
  checkedType?: CheckedType;
  role?: Role;
  displayColumn?: DisplayColumn;
}

export interface User extends BaseEntity {}
