import axios from 'axios';
import { configureApiClient } from './interceptors/index.js';
import { env } from '../config/env.js';
import { REFRESH_TOKEN_KEY, TOKEN_KEY } from '../features/auth/authConstants.js';

const apiClient = axios.create({
  baseURL: env.apiBaseUrl,
  headers: {
    'Content-Type': 'application/json',
  },
});

let isConfigured = false;

export const initializeApiClient = ({ onRefreshSession, onClearSession }) => {
  if (isConfigured) {
    return;
  }

  configureApiClient(apiClient, {
    onRefreshSession,
    onClearSession: onClearSession ?? (() => {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(REFRESH_TOKEN_KEY);
    }),
  });

  isConfigured = true;
};

export default apiClient;
