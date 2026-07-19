import apiClient from '../api/client.js';

export const listTenants = async () => {
  const { data } = await apiClient.get('/tenant');
  return data.data;
};

export const getTenant = async (tenantId) => {
  const { data } = await apiClient.get(`/tenant/${tenantId}`);
  return data.data;
};

export const getCurrentTenant = async () => {
  const { data } = await apiClient.get('/tenant/current');
  return data.data;
};

export const createTenant = async (payload) => {
  const { data } = await apiClient.post('/tenant', payload);
  return data.data;
};

export const updateTenant = async (tenantId, payload) => {
  const { data } = await apiClient.patch(`/tenant/${tenantId}`, payload);
  return data.data;
};

export const deleteTenant = async (tenantId) => {
  const { data } = await apiClient.delete(`/tenant/${tenantId}`);
  return data.data;
};
