import ajax from "../utils/ajax";

export function selectAccounts(data: any): Promise<any> {
  return ajax.get('/accounts', data);
}

export function insertAccount(account: any): Promise<any> {
  return ajax.post('/accounts', account);
}

export function updateAccount(id: number, account: any): Promise<any> {
  return ajax.put(`/accounts/${id}`, account);
}