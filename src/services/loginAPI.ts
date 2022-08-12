import ajax from "../utils/ajax";

export function login(username: string, password: string) {
  return ajax.login(username, password);
}