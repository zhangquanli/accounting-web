import ajax from "../utils/ajax";

export function selectSubjects() {
  return ajax.get('/subjects');
}

export function insertSubject(data: any) {
  return ajax.post('/subjects', data);
}

export function updateSubject(id: string, data: any) {
  return ajax.put(`/subjects/${id}`, data);
}
