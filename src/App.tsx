import React from 'react';
import { Route, Routes } from "react-router-dom";
import Login from "./pages/Login";
import Manager from "./pages/Manager";

const App = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/*" element={<Manager />} />
    </Routes>
  );
}

export default App;
