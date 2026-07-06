import apiClient from '../api/client.js';

export const listAdmins = async () => {
  const { data } = await apiClient.get('/admins');
  return data.data;
};

export const createAdmin = async (payload) => {
  const { data } = await apiClient.post('/admins', payload);
  return data.data;
};

export const updateAdmin = async (tenantId, adminId, payload) => {
  const { data } = await apiClient.patch(`/admins/${tenantId}/${adminId}`, payload);
  return data.data;
};

export const deleteAdmin = async (tenantId, adminId) => {
  const { data } = await apiClient.delete(`/admins/${tenantId}/${adminId}`);
  return data.data;
};
