export interface BaseEntity {
  id?: number;
}

export interface ListResult<T> {
  total: number;
  rows: T[];
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
  roleRelPageInfos?: RoleRelPageInfo[];
  roleRelComponentInfos?: RoleRelComponentInfo[];
  roleRelDisplayColumns?: RoleRelDisplayColumn[];
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

export interface User extends BaseEntity {
  username?: string;
  password?: string;
  userRelRoles?: UserRelRole[];
}

export interface UserRelRole extends BaseEntity {
  value?: string;
  label?: string;
  fullValue?: string;
  fullLabel?: string;
  role?: Role;
  user?: User;
}
