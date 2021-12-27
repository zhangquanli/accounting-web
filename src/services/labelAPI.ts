import ajax from "../utils/ajax";

export function selectLabels() {
  return ajax.get('/labels');
}