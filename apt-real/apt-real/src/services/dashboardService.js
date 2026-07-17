import apiClient from './apiClient';

// GET /api/dashboard/stats

export function getDashboardStats() {
  return apiClient.get('/dashboard/stats').then((res) => res.data);
}
