import ajax from "../utils/ajax";

export function selectVouchers(params: any): Promise<any> {
  return ajax.get('/vouchers', params);
}

export function insertVoucher(data: any): Promise<any> {
  return ajax.post('/vouchers', data);
}

export function deleteVoucher(id: number): Promise<any> {
  return ajax.delete(`/vouchers/${id}`);
}

export function getVoucher(id: number): Promise<any> {
  return ajax.get(`/vouchers/${id}`);
}
