import apiClient from './apiClient';

// GET /api/owners
export function getOwners() {
  return apiClient.get('/owners').then((res) => res.data);
}

// GET /api/owners/{id}
export function getOwner(id) {
  return apiClient.get(`/owners/${id}`).then((res) => res.data);
}

// POST /api/owners
export function createOwner(owner) {
  return apiClient.post('/owners', owner).then((res) => res.data);
}

// PUT /api/owners/{id}
export function updateOwner(id, owner) {
  return apiClient.put(`/owners/${id}`, owner).then((res) => res.data);
}

// DELETE /api/owners/{id}
export function deleteOwner(id) {
  return apiClient.delete(`/owners/${id}`);
}
