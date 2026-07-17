import apiClient from './apiClient';

// GET /api/users  -> liiska dadka is-diiwaangeliyay (ADMIN kaliya ayaa arki kara)
export function getUsers() {
  return apiClient.get('/users').then((res) => res.data);
}

export function getUser(id) {
  return apiClient.get(`/users/${id}`).then((res) => res.data);
}

// PUT /api/users/:id -> admin-ka kaliya ayaa wax ka beddeli kara shaqaale
export function updateUser(id, payload) {
  return apiClient.put(`/users/${id}`, payload).then((res) => res.data);
}

// DELETE /api/users/:id -> admin-ka kaliya ayaa tirtiri kara shaqaale
export function deleteUser(id) {
  return apiClient.delete(`/users/${id}`).then((res) => res.data);
}