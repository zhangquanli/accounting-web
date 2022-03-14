import ajax from "../utils/ajax";

export function selectSubjectBalances(data: any) {
  return ajax.get(`/subjectBalances`, data);
}