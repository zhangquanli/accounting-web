import ajax from "../utils/ajax";
import axios, { AxiosRequestConfig } from "axios";
import { getAuthorization, getBaseURL } from "../constants/base";
import { json2Query } from "../utils/url";

export function selectAccountingEntries(data: any): Promise<any> {
  return ajax.get('/accountingEntries', data);
}

export function exportAccountingEntries(data: any): Promise<any> {
  const config: AxiosRequestConfig = {
    baseURL: getBaseURL(),
    url: '/accountingEntries/export' + json2Query(data),
    method: 'get',
    responseType: 'blob',
    headers: {
      'Authorization': getAuthorization(),
    },
  };
  return axios.create()
    .request(config)
    .then((response) => {
      const filename = new Date().getTime() + ".xlsx";
      const blob = new Blob([response.data],
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
      return Promise.resolve();
    })
    .catch((error) => {
      return Promise.reject(error);
    });
}