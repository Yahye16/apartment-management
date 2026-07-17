import apiClient from './apiClient';

// GET /api/payments  
export function getPayments(leaseId) {
  const params = leaseId ? { leaseId } : {};
  return apiClient.get('/payments', { params }).then((res) => res.data);
}

// GET /api/payments/{id}
export function getPayment(id) {
  return apiClient.get(`/payments/${id}`).then((res) => res.data);
}

// POST /api/payments/lease/{leaseId}
export function createPayment(leaseId, payment) {
  return apiClient.post(`/payments/lease/${leaseId}`, payment).then((res) => res.data);
}

// PUT /api/payments/{id}
export function updatePayment(id, payment) {
  return apiClient.put(`/payments/${id}`, payment).then((res) => res.data);
}

// DELETE /api/payments/{id}
export function deletePayment(id) {
  return apiClient.delete(`/payments/${id}`);
}
