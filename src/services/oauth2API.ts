import { nanoid } from "@reduxjs/toolkit";
import axios, { AxiosRequestConfig } from "axios";
import { getBaseURL } from "../constants/base";

const baseURL = getBaseURL();
const oauth2Axios = axios.create({ baseURL });

export function token(username: string, password: string): Promise<any> {
  let clientId = localStorage.getItem('clientId');
  if (!clientId) {
    clientId = nanoid();
    localStorage.setItem('clientId', clientId);
  }
  const data = {
    'grant_type': 'password',
    'client_id': clientId,
    'client_secret': clientId,
    'username': username,
    'password': password,
  };
  return oauth2Axios.request(config(data)).then((response) => {
    const { data } = response;
    const { access_token: accessToken, token_type: tokenType, refresh_token: refreshToken } = data;
    localStorage.setItem('token_type', tokenType);
    localStorage.setItem('access_token', accessToken);
    localStorage.setItem('refresh_token', refreshToken);
    return Promise.resolve(data);
  }, (error) => {
    console.log('密码登录失败', error);
    return Promise.reject(error);
  });
}

export function refreshToken(): Promise<any> {
  localStorage.removeItem('token_type');
  localStorage.removeItem('access_token');
  let clientId = localStorage.getItem('clientId');
  let refreshToken = localStorage.getItem('refresh_token');
  if (!clientId || !refreshToken) {
    return Promise.reject();
  }
  const data = {
    'grant_type': 'refresh_token',
    'client_id': clientId,
    'client_secret': clientId,
    'refresh_token': refreshToken,
  };
  return oauth2Axios.request(config(data)).then((response) => {
    const { data } = response;
    const { access_token: accessToken, token_type: tokenType, refresh_token: refreshToken } = data;
    localStorage.setItem('token_type', tokenType);
    localStorage.setItem('access_token', accessToken);
    localStorage.setItem('refresh_token', refreshToken);
    return Promise.resolve();
  }, (error) => {
    console.log('刷新令牌失败', error);
    return Promise.reject();
  });
}

function config<D = any>(data: D) {
  const config: AxiosRequestConfig = {
    baseURL: baseURL,
    url: '/oauth2/token',
    method: "post",
    data: data,
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
  return config;
}
