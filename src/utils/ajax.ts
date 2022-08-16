import axios, { AxiosRequestConfig, AxiosResponse } from "axios";
import { message } from "antd";
import { json2Query } from "./url";
import { getAuthorization, getBaseURL } from "../constants/constants";
import { refreshToken } from "../services/oauth2API";

let baseURL = getBaseURL();
const commonAxios = axios.create({ baseURL });

// 添加请求拦截器
commonAxios.interceptors.request.use((config) => {
  const { headers = {} } = config;
  config.headers = { ...headers, 'Authorization': getAuthorization() };
  return { ...config };
});

// 添加响应拦截器
commonAxios.interceptors.response.use((value) => {
  return value.data;
}, (error) => {
  console.log('访问接口异常', error.response);
  switch (error.response.status) {
    case 400:
    case 401:
      return refreshToken().then(() => {
        return ajax.request(error.response.config);
      }).catch((error) => {
        message.destroy();
        message.error('登录过期，1秒后跳转登录页面', 1)
          .then(() => {
            window.location.href = '/login';
          });
        return Promise.reject(error);
      });
    case 403:
      message.destroy();
      message.error('访问权限不足').then(undefined);
      return Promise.reject(error);
    default:
      message.destroy();
      message.error('网络异常，请稍后重试').then(undefined);
      return Promise.reject(error);
  }
});

// 调用接口工具类
class Ajax {
  request<T = any, R = AxiosResponse<T>, D = any>(config: AxiosRequestConfig<D>): Promise<R> {
    return commonAxios.request({ ...config });
  }

  get<T = any, R = AxiosResponse<T>, D = any>(url: string, data?: D, config?: AxiosRequestConfig<D>): Promise<R> {
    return commonAxios.request({ ...config, url: url + json2Query(data), method: 'get' });
  }

  post<T = any, R = AxiosResponse<T>, D = any>(url: string, data?: D, config?: AxiosRequestConfig): Promise<R> {
    return commonAxios.request({ ...config, url, method: 'post', data })
  }

  put<T = any, R = AxiosResponse<T>, D = any>(url: string, data?: D, config?: AxiosRequestConfig): Promise<R> {
    return commonAxios.request({ ...config, url, method: 'put', data });
  }

  delete<T = any, R = AxiosResponse<T>>(url: string, config?: AxiosRequestConfig): Promise<R> {
    return commonAxios.request({ ...config, url, method: 'delete' });
  }
}

const ajax = new Ajax();

export default ajax;

