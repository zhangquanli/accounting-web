import ajax from "../utils/ajax";

export function selectSubjects(data: any) {
  return ajax.get('/subjects', data);
}

export function insertSubject(data: any) {
  return ajax.post('/subjects', data);
}

export function updateSubject(id: number, data: any) {
  return ajax.put(`/subjects/${id}`, data);
}
