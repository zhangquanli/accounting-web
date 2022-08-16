import ajax from "../utils/ajax";

export function selectLabels(): Promise<any> {
  return ajax.get('/labels');
}