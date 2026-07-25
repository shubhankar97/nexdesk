import apiClient from '../api/client.js';

export const getCurrentSubscription = async () => {
  const { data } = await apiClient.get('/subscription/current');
  return data.data;
};

export const listAvailablePlans = async () => {
  const { data } = await apiClient.get('/subscription/plans');
  return data.data;
};

export const createCheckout = async (planId) => {
  const { data } = await apiClient.post('/subscription/checkout', { planId });
  return data.data;
};
