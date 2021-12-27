import ajax from "../utils/ajax";

export function insertVoucher(data: any) {
  return ajax.post('/vouchers', data);
}