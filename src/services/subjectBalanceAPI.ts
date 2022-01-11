import ajax from "../utils/ajax";

export function selectSubjectBalances(search: string) {
  return ajax.get(`/subjectBalances?${search}`);
}