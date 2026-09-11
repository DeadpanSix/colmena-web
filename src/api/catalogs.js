import api from './client';

export async function getDocumentTypes() {
  const response = await api.get('/document-types');
  return response.data;
}

export async function getDepartments() {
  const response = await api.get('/departments');
  return response.data;
}

export async function getTeams() {
  const response = await api.get('/teams');
  return response.data;
}
