import axios, { AxiosRequestConfig } from "axios";
import { message } from "antd";
import { json2Query } from "./url";
import { nanoid } from "@reduxjs/toolkit";

let baseURL = '/api/v1';
if (window.location.host === 'localhost:3000') {
  baseURL = 'http://localhost:9324/api/v1';
}

// 创建 axios 对象
const commonAxios = axios.create({ baseURL });

// 添加请求拦截器
commonAxios.interceptors.request.use((config) => {
  const { headers = {} } = config;
  const tokenType = localStorage.getItem("token_type");
  const accessToken = localStorage.getItem("access_token");
  if (tokenType && accessToken) {
    headers['Authorization'] = `${tokenType} ${accessToken}`;
  }
  return { ...config, headers };
});

// 添加响应拦截器
commonAxios.interceptors.response.use((value) => {
  return value.data;
}, (error) => {
  console.log('访问接口异常', error.response);
  switch (error.response.status) {
    case 400:
    case 401:
      localStorage.removeItem('token_type');
      localStorage.removeItem('access_token');
      let clientId = localStorage.getItem('clientId');
      let refreshToken = localStorage.getItem('refresh_token');
      if (!clientId || !refreshToken) {
        if (window.location.pathname.startsWith('/login')) {
          window.location.pathname = '/login';
          message.destroy();
          message.error('登录过期，请重新登录').then(undefined);
        }
      }
      // 使用refresh_token获取access_token
      const data = {
        'client_id': clientId,
        'client_secret': clientId,
        'grant_type': 'refresh_token',
        'refresh_token': refreshToken,
      };
      const config: AxiosRequestConfig = {
        baseURL,
        url: '/oauth2/token',
        method: 'post',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        data,
        transformRequest: (data) => {
          let dataStr = '';
          for (const key in data) {
            dataStr += `${encodeURIComponent(key)}=${encodeURIComponent(data[key])}&`;
          }
          dataStr = dataStr.substring(0, dataStr.length - 1)
          return dataStr;
        },
      };
      return new Promise((resolve, reject) => {
        axios.request(config).then(value => {
          const { data } = value;
          const { access_token: accessToken, token_type: tokenType, refresh_token: refreshToken } = data;
          localStorage.setItem('token_type', tokenType);
          localStorage.setItem('access_token', accessToken);
          localStorage.setItem('refresh_token', refreshToken);
          // 访问原有接口
          return commonAxios.request(error.response.config);
        }, reason => {
          console.log('刷新令牌失败', reason.response);
          if (!window.location.pathname.startsWith('/login')) {
            window.location.pathname = '/login';
            message.destroy();
            message.error('登录过期，请重新登录').then(undefined);
          }
          return reject(reason);
        });
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
})

// 通用请求
export function request(url: string, data?: any, config?: AxiosRequestConfig): Promise<any> {
  return commonAxios.request({ ...config, url, data });
}

class Ajax {
  // get请求
  get(url: string, data?: any, config?: AxiosRequestConfig) {
    const newConfig: AxiosRequestConfig = { ...config, method: 'get' };
    return request(url + json2Query(data), undefined, newConfig);
  }

  // post请求
  post(url: string, data?: any, config?: AxiosRequestConfig) {
    const newConfig: AxiosRequestConfig = { ...config, method: 'post' };
    return request(url, data, newConfig);
  }

  // put请求
  put(url: string, data?: any, config?: AxiosRequestConfig) {
    const newConfig: AxiosRequestConfig = { ...config, method: 'put' };
    return request(url, data, newConfig);
  }

  // delete请求
  delete(url: string, config?: AxiosRequestConfig) {
    const newConfig: AxiosRequestConfig = { ...config, method: 'delete' };
    return request(url, undefined, newConfig);
  }

  // 登录请求
  login(username: string, password: string) {
    let clientId = localStorage.getItem("clientId");
    if (!clientId) {
      clientId = nanoid();
      localStorage.setItem("clientId", clientId);
    }
    const data = {
      grant_type: 'password',
      client_id: clientId,
      client_secret: clientId,
      username, password,
    };
    const config: AxiosRequestConfig = {
      baseURL,
      url: '/oauth2/token',
      method: 'post',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      data,
      transformRequest: (data) => {
        let dataStr = '';
        for (const key in data) {
          dataStr += `${encodeURIComponent(key)}=${encodeURIComponent(data[key])}&`;
        }
        dataStr = dataStr.substring(0, dataStr.length - 1)
        return dataStr;
      },
    };
    return axios.request(config).then(value => {
      const { data } = value;
      const { access_token: accessToken, token_type: tokenType, refresh_token: refreshToken } = data;
      localStorage.setItem('token_type', tokenType);
      localStorage.setItem('access_token', accessToken);
      localStorage.setItem('refresh_token', refreshToken);
      message.destroy();
      message.success('登录成功').then(undefined);
      return Promise.resolve(data);
    }, reason => {
      console.log('登录失败', reason.response);
      if (reason.response.status === 400) {
        message.destroy();
        message.error("账号或密码错误").then(undefined);
      } else {
        message.destroy();
        message.error('网络异常，请稍后重试').then(undefined);
      }
      return Promise.reject(reason);
    });
  }

  // 下载请求
  download(url: string, data?: any, config?: AxiosRequestConfig) {
    const newConfig: AxiosRequestConfig = { ...config, method: 'get' };
    axios.create({ baseURL, responseType: 'blob' })
      .get(url + json2Query(data), newConfig)
      .then(value => {
        // 获取文件名
        const filename = new Date().getTime() + ".xlsx";
        const blob = new Blob([value.data],
          { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        const href = window.URL.createObjectURL(blob);

        const element = document.createElement('a');
        element.style.display = 'none';
        element.href = href;
        element.download = filename;
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
        window.URL.revokeObjectURL(href);
      })
      .catch(error => {
        console.log(error);
        message.destroy();
        message.error('下载失败').then(undefined);
        return Promise.reject(error);
      });
  }
}

const ajax = new Ajax();

export default ajax;

