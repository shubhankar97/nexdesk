import apiClient from '../api/client.js';

export const listCustomers = async () => {
  const { data } = await apiClient.get('/customers');
  return data.data;
};

export const listAllCustomers = async () => {
  const { data } = await apiClient.get('/customers/all');
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

export const updateCustomerForMaster = async (tenantId, customerId, payload) => {
  const { data } = await apiClient.patch(`/customers/${tenantId}/${customerId}`, payload);
  return data.data;
};

export const deleteCustomer = async (customerId) => {
  const { data } = await apiClient.delete(`/customers/${customerId}`);
  return data.data;
};

export const deleteCustomerForMaster = async (tenantId, customerId) => {
  const { data } = await apiClient.delete(`/customers/${tenantId}/${customerId}`);
  return data.data;
};
