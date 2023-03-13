import React from "react";
import { RouteObject } from "react-router-dom";
import Login from "./pages/Login";
import Navigator from "./pages/Navigator";
import VoucherManager from "./pages/VoucherManager";
import AccountingEntryManager from "./pages/AccountingEntryManager";
import AccountManager from "./pages/AccountManager";
import SubjectManager from "./pages/SubjectManager";
import PageManager from "./pages/PageManager";
import ApiManager from "./pages/ApiManager";
import RoleManager from "./pages/RoleManager";

// 整个应用的路由配置
const routes: RouteObject[] = [
  { path: "/login", element: <Login /> },
  {
    path: "/",
    element: <Navigator />,
    children: [
      { path: "/voucherManager", element: <VoucherManager /> },
      { path: "/accountingEntryManager", element: <AccountingEntryManager /> },
      { path: "/system/apiManager", element: <ApiManager /> },
      { path: "/system/pageManager", element: <PageManager /> },
      { path: "/system/roleManager", element: <RoleManager /> },
      { path: "/system/accountManager", element: <AccountManager /> },
      { path: "/system/subjectManager", element: <SubjectManager /> },
    ],
  },
];

export default routes;
