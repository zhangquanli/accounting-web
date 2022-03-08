import ajax from "../utils/ajax";

export function selectVouchers(params: any) {
  return ajax.get('/vouchers', params);
}

export function insertVoucher(data: any) {
  return ajax.post('/vouchers', data);
}

export function deleteVoucher(id: number) {
  return ajax.delete(`/vouchers/${id}`);
}

export function getVoucher(id: number) {
  return ajax.get(`/vouchers/${id}`);
}
