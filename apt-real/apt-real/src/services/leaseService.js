import apiClient from './apiClient';

// GET /api/leases
export function getLeases() {
  return apiClient.get('/leases').then((res) => res.data);
}

// GET /api/leases/{id}
export function getLease(id) {
  return apiClient.get(`/leases/${id}`).then((res) => res.data);
}

// POST /api/leases/tenant/{tenantId}/unit/{unitId}

export function createLease(tenantId, unitId, lease) {
  return apiClient
    .post(`/leases/tenant/${tenantId}/unit/${unitId}`, lease)
    .then((res) => res.data);
}

// PUT /api/leases/{id}

export function updateLease(id, lease) {
  return apiClient.put(`/leases/${id}`, lease).then((res) => res.data);
}

// DELETE /api/leases/{id}
export function deleteLease(id) {
  return apiClient.delete(`/leases/${id}`);
}

// POST /api/leases/recalculate-balances

export function recalculateBalances() {
  return apiClient.post('/leases/recalculate-balances').then((res) => res.data);
}