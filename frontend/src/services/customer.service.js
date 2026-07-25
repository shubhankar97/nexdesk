import apiClient from '../api/client.js';

export const listCustomers = async () => {
  const { data } = await apiClient.get('/customers');
  return data.data;
};

export const createCustomer = async (payload) => {
  const { data } = await apiClient.post('/customers', payload);
  return data.data;
};

export const updateCustomer = async (customerId, payload) => {
  const { data } = await apiClient.patch(`/customers/${customerId}`, payload);
  return data.data;
};

export const deleteCustomer = async (customerId) => {
  const { data } = await apiClient.delete(`/customers/${customerId}`);
  return data.data;
};
