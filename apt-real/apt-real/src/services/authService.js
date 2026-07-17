import apiClient from './apiClient';

// POST /api/auth/login

export function login(username, password) {
  return apiClient.post('/auth/login', { username, password }).then((res) => res.data);
}

// POST /api/auth/register

export function register(fullName, username, email, phone, password) {
  return apiClient
    .post('/auth/register', { fullName, username, email, phone, password })
    .then((res) => res.data);
}
