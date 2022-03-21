import axios, { AxiosRequestConfig } from "axios";
import { message } from "antd";
import { json2Query } from "./url";

const baseURL = 'http://localhost:9324/api/v1';
// const baseURL = '/api/v1';

// 创建 axios 对象
const myAxios = axios.create({ baseURL });

// 添加请求拦截器
myAxios.interceptors.request.use((config) => {
  // 添加token头信息
  return config;
});

// 通用请求
function request(url: string, data?: any, config?: AxiosRequestConfig): Promise<any> {
  return new Promise((resolve, reject) => {
    myAxios.request({ ...config, url, data }).then(response => {
      resolve(response.data);
    }).catch(error => {
      message.destroy();
      message.error('网络异常，请稍后重试').then(undefined);
      reject(error);
    });
  });
}

class Ajax {
  // get 请求
  get(url: string, data?: any, config?: AxiosRequestConfig) {
    const newConfig: AxiosRequestConfig = { ...config, method: 'get' };
    return request(url + json2Query(data), undefined, newConfig);
  }

  // post 请求
  post(url: string, data?: any, config?: AxiosRequestConfig) {
    const newConfig: AxiosRequestConfig = { ...config, method: 'post' };
    return request(url, data, newConfig);
  }

  // put 请求
  put(url: string, data?: any, config?: AxiosRequestConfig) {
    const newConfig: AxiosRequestConfig = { ...config, method: 'put' };
    return request(url, data, newConfig);
  }

  // delete 请求
  delete(url: string, config?: AxiosRequestConfig) {
    const newConfig: AxiosRequestConfig = { ...config, method: 'delete' };
    return request(url, undefined, newConfig);
  }

  // 下载请求
  download(url: string, data?: any, config?: AxiosRequestConfig) {
    const newConfig: AxiosRequestConfig = { ...config, method: 'get' };
    axios.create({ baseURL, responseType: 'blob' })
      .get(url + json2Query(data), newConfig)
      .then(response => {
        // 获取文件名
        const filename = new Date().getTime() + ".xlsx";
        const blob = new Blob([response.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
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
      });
  }
}

const ajax = new Ajax();

export default ajax;

