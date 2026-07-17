import apiClient from './apiClient';

// GET /api/maintenance-requests
export function getMaintenanceRequests() {
  return apiClient.get('/maintenance-requests').then((res) => res.data);
}

// GET /api/maintenance-requests/{id}
export function getMaintenanceRequest(id) {
  return apiClient.get(`/maintenance-requests/${id}`).then((res) => res.data);
}

// POST /api/maintenance-requests/unit/{unitId}

export function createMaintenanceRequest(unitId, request) {
  return apiClient
    .post(`/maintenance-requests/unit/${unitId}`, request)
    .then((res) => res.data);
}

// PUT /api/maintenance-requests/{id}

export function updateMaintenanceRequest(id, request) {
  return apiClient.put(`/maintenance-requests/${id}`, request).then((res) => res.data);
}

// PUT /api/maintenance-requests/{id}/assign/{userId}

export function assignMaintenanceRequest(id, userId) {
  return apiClient
    .put(`/maintenance-requests/${id}/assign/${userId}`)
    .then((res) => res.data);
}

// DELETE /api/maintenance-requests/{id}
export function deleteMaintenanceRequest(id) {
  return apiClient.delete(`/maintenance-requests/${id}`);
}
