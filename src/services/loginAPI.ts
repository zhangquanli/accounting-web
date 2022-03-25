import { AxiosRequestConfig } from "axios";
import { request } from "../utils/ajax";

export function login(data: any) {
  const config: AxiosRequestConfig = {
    method: 'post',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    transformRequest: (data) => {
      let dataStr = '';
      for (const key in data) {
        dataStr += `${encodeURIComponent(key)}=${encodeURIComponent(data[key])}&`;
      }
      dataStr = dataStr.substring(0, dataStr.length - 1)
      return dataStr;
    },
  };
  return request('/password_login', data, config);
}