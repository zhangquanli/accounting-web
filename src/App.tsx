import React from 'react';
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Login from "./pages/Login";
import Manager from "./pages/Manager";
import VoucherManager from "./pages/VoucherManager";
import AccountingEntryManager from "./pages/AccountingEntryManager";
import AccountManager from "./pages/AccountManager";
import SubjectManager from "./pages/SubjectManager";

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="login" element={<Login />} />
        <Route path="*" element={<Manager />}>
          <Route index={true} element={<VoucherManager />} />
          <Route path="voucherManager" element={<VoucherManager />} />
          <Route path="accountingEntryManager" element={<AccountingEntryManager />} />
          <Route path="system/*">
            <Route path="accountManager" element={<AccountManager />} />
            <Route path="subjectManager" element={<SubjectManager />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
