import apiClient from './apiClient';

// GET /api/tenants
export function getTenants() {
  return apiClient.get('/tenants').then((res) => res.data);
}

// GET /api/tenants/{id}
export function getTenant(id) {
  return apiClient.get(`/tenants/${id}`).then((res) => res.data);
}

// POST /api/tenants
export function createTenant(tenant) {
  return apiClient.post('/tenants', tenant).then((res) => res.data);
}

// PUT /api/tenants/{id}
export function updateTenant(id, tenant) {
  return apiClient.put(`/tenants/${id}`, tenant).then((res) => res.data);
}

// DELETE /api/tenants/{id}
export function deleteTenant(id) {
  return apiClient.delete(`/tenants/${id}`);
}
