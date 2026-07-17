import apiClient from './apiClient';

// GET /api/units  
export function getUnits(apartmentId, status) {
  const params = {};
  if (apartmentId) params.apartmentId = apartmentId;
  if (status) params.status = status;
  return apiClient.get('/units', { params }).then((res) => res.data);
}

// GET /api/units/{id}
export function getUnit(id) {
  return apiClient.get(`/units/${id}`).then((res) => res.data);
}

// POST /api/units/apartment/{apartmentId}
export function createUnit(apartmentId, unit) {
  return apiClient.post(`/units/apartment/${apartmentId}`, unit).then((res) => res.data);
}

// PUT /api/units/{id}
export function updateUnit(id, unit) {
  return apiClient.put(`/units/${id}`, unit).then((res) => res.data);
}

// DELETE /api/units/{id}
export function deleteUnit(id) {
  return apiClient.delete(`/units/${id}`);
}
