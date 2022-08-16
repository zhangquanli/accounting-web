import ajax from "../utils/ajax";

export function selectSubjects(data: any): Promise<any> {
  return ajax.get('/subjects', data);
}

export function insertSubject(data: any): Promise<any> {
  return ajax.post('/subjects', data);
}

export function updateSubject(id: number, data: any): Promise<any> {
  return ajax.put(`/subjects/${id}`, data);
}
