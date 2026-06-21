import axios from 'axios';
import { env } from '../config/env.js';

const apiClient = axios.create({
  baseURL: env.apiBaseUrl,
  headers: {
    'Content-Type': 'application/json',
  },
});

let refreshPromise = null;

const getRefreshHandler = () => {
  if (typeof window !== 'undefined' && window.__nexdeskRefreshSession) {
    return window.__nexdeskRefreshSession;
  }

  return null;
};

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const isUnauthorized = error.response?.status === 401;
    const isRefreshRequest = originalRequest?.url?.includes('/auth/refresh');
    const isAuthRequest =
      originalRequest?.url?.includes('/auth/master/login') ||
      originalRequest?.url?.includes('/auth/admin/login') ||
      originalRequest?.url?.includes('/auth/customer/login') ||
      originalRequest?.url?.includes('/auth/forgot-password') ||
      originalRequest?.url?.includes('/auth/reset-password');

    if (!isUnauthorized || isRefreshRequest || isAuthRequest || originalRequest._retry) {
      if (isUnauthorized && !isAuthRequest) {
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
      }

      return Promise.reject(error);
    }

    const refreshHandler = getRefreshHandler();

    if (!refreshHandler) {
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    try {
      if (!refreshPromise) {
        refreshPromise = refreshHandler().finally(() => {
          refreshPromise = null;
        });
      }

      const newAccessToken = await refreshPromise;

      if (!newAccessToken) {
        return Promise.reject(error);
      }

      originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
      return apiClient(originalRequest);
    } catch (refreshError) {
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      return Promise.reject(refreshError);
    }
  }
);

export default apiClient;
