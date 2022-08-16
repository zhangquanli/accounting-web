import ajax from "../utils/ajax";

export function selectSubjectBalances(data: any): Promise<any> {
  return ajax.get(`/subjectBalances`, data);
}