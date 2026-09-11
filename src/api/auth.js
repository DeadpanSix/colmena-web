import api, { setAccessToken } from './client';

export async function login(email, password) {
  const response = await api.post('/auth/login', { email, password });
  setAccessToken(response.data.accessToken);
  return response.data.user;
}

export async function logout() {
  await api.post('/auth/logout');
  setAccessToken(null);
}

export async function refreshAccessToken() {
  const response = await api.post('/auth/refresh');
  setAccessToken(response.data.accessToken);
  return response.data.accessToken;
}

export async function getCurrentUser() {
  const response = await api.get('/auth/me');
  return response.data;
}
