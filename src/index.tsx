import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import * as serviceWorker from "./serviceWorker";
import { Provider } from "react-redux";
import { store } from "./app/store";
import { ConfigProvider } from "antd";
import zhCn from "antd/lib/locale/zh_CN";
import moment from "moment";
import "moment/locale/zh-cn";
import App from "./App";
import { BrowserRouter } from "react-router-dom";

moment.locale("zh-cn");

ReactDOM.render(
  <React.StrictMode>
    <Provider store={store}>
      <ConfigProvider locale={zhCn}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </ConfigProvider>
    </Provider>
  </React.StrictMode>,
  document.getElementById("root")
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
