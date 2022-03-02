import ajax from "../utils/ajax";

export function selectAccounts(data: any) {
  return ajax.get('/accounts', data);
}

export function insertAccount(account: any) {
  return ajax.post('/accounts', account);
}

export function updateAccount(id: number, account: any) {
  return ajax.put(`/accounts/${id}`, account);
}