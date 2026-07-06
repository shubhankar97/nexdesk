import apiClient from '../api/client.js';

export const listOrders = async (params = {}) => {
  const { data } = await apiClient.get('/orders', { params });
  return data.data;
};

export const listOrderCustomers = async () => {
  const { data } = await apiClient.get('/orders/customers');
  return data.data;
};

export const getOrder = async (id) => {
  const { data } = await apiClient.get(`/orders/${id}`);
  return data.data;
};

export const createOrder = async (payload) => {
  const { data } = await apiClient.post('/orders', payload);
  return data.data;
};

export const updateOrder = async (id, payload) => {
  const { data } = await apiClient.patch(`/orders/${id}`, payload);
  return data.data;
};

export const deleteOrder = async (id) => {
  const { data } = await apiClient.delete(`/orders/${id}`);
  return data.data;
};

export const uploadCertificate = async (id, payload) => {
  const { data } = await apiClient.post(`/orders/${id}/certificate`, payload);
  return data.data;
};

export const downloadCertificate = async (id) => {
  const { data } = await apiClient.get(`/orders/${id}/certificate`);
  return data.data;
};

export const getCertificateVersions = async (id) => {
  const { data } = await apiClient.get(`/orders/${id}/certificate/versions`);
  return data.data;
};
