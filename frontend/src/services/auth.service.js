import apiClient from '../api/client.js';
import { ROLES } from '../constants/roles.js';

const LOGIN_ENDPOINTS = {
  [ROLES.MASTER]: '/auth/master/login',
  [ROLES.ADMIN]: '/auth/admin/login',
  [ROLES.CUSTOMER]: '/auth/customer/login',
};

export const login = async (role, credentials) => {
  const endpoint = LOGIN_ENDPOINTS[role];

  if (!endpoint) {
    throw new Error('Invalid role');
  }

  const { data } = await apiClient.post(endpoint, credentials);
  return data.data;
};

export const refreshTokens = async (refreshToken) => {
  const { data } = await apiClient.post('/auth/refresh', { refreshToken });
  return data.data;
};

export const logout = async () => {
  await apiClient.post('/auth/logout');
};

export const getMe = async () => {
  const { data } = await apiClient.get('/auth/me');
  return data.data;
};

export const forgotPassword = async (email) => {
  const { data } = await apiClient.post('/auth/forgot-password', { email });
  return data;
};

export const resetPassword = async (payload) => {
  const { data } = await apiClient.post('/auth/reset-password', payload);
  return data;
};
