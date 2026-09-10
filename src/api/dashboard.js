import api from './client';

export async function getSummary() {
  const response = await api.get('/dashboard/summary');
  return response.data;
}

export async function getTeamDashboard(teamId) {
  const response = await api.get(`/dashboard/team/${teamId}`);
  return response.data;
}
