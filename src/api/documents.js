import api from './client';

export async function getDocuments() {
  const response = await api.get('/documents');
  return response.data;
}

export async function getDocumentById(id) {
  const response = await api.get(`/documents/${id}`);
  return response.data;
}

export async function completeRoutingStep(documentId, order, comment) {
  const response = await api.patch(`/documents/${documentId}/routing/${order}/complete`, { comment });
  return response.data;
}

export async function respondToDocument(documentId, content) {
  const response = await api.post(`/documents/${documentId}/response`, { content });
  return response.data;
}

export async function cancelDocument(documentId) {
  const response = await api.patch(`/documents/${documentId}/cancel`);
  return response.data;
}

export async function createDocument(formData) {
  const response = await api.post('/documents', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
}

export async function assignRouting(documentId, steps) {
  const response = await api.post(`/documents/${documentId}/routing`, { steps });
  return response.data;
}
