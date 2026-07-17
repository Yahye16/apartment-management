import apiClient from './apiClient';

// GET /api/apartments  (optionally filter by owner: /api/apartments?ownerId=3)
export function getApartments(ownerId) {
  const params = ownerId ? { ownerId } : {};
  return apiClient.get('/apartments', { params }).then((res) => res.data);
}

// GET /api/apartments/{id}
export function getApartment(id) {
  return apiClient.get(`/apartments/${id}`).then((res) => res.data);
}

// POST /api/apartments/owner/{ownerId}

export function createApartment(ownerId, apartment) {
  return apiClient.post(`/apartments/owner/${ownerId}`, apartment).then((res) => res.data);
}

// PUT /api/apartments/{id}
// Body: { apartmentName, address, totalFloors, totalUnits, description, status }
export function updateApartment(id, apartment) {
  return apiClient.put(`/apartments/${id}`, apartment).then((res) => res.data);
}

// DELETE /api/apartments/{id}
export function deleteApartment(id) {
  return apiClient.delete(`/apartments/${id}`);
}
