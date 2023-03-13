import React from "react";
import { useRoutes } from "react-router-dom";
import routes from "./routes";

interface Props {}

const App: React.FC<Props> = () => {
  return useRoutes(routes);
};

export default App;
