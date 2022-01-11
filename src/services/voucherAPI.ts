import ajax from "../utils/ajax";

export function selectVouchers(params: any) {
  return ajax.get('/vouchers', params);
}

export function getVoucher(id: number) {
  return ajax.get(`/vouchers/${id}`);
}

export function insertVoucher(data: any) {
  return ajax.post('/vouchers', data);
}