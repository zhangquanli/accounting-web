import ajax from "../utils/ajax";

export function selectAccounts() {
  return ajax.get('/accounts');
}

export function insertAccount(account: any) {
  return ajax.post('/accounts', account);
}