import api from './client';

export async function getDocuments() {
  const response = await api.get('/documents');
  return response.data;
}
