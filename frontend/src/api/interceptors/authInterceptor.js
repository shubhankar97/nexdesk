import { TENANT_HEADER } from '../../constants/tenant.js';
import { TOKEN_KEY } from '../../features/auth/authConstants.js';
import { getTenantSubdomain } from '../../utils/subdomain.js';

export const attachAuthRequestInterceptor = (apiClient) => {
  apiClient.interceptors.request.use((config) => {
    const token = localStorage.getItem(TOKEN_KEY);

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    const tenantSubdomain = getTenantSubdomain();

    if (tenantSubdomain) {
      config.headers[TENANT_HEADER] = tenantSubdomain;
    }

    return config;
  });
};

export const attachAuthResponseInterceptor = (apiClient, { onRefreshSession, onClearSession }) => {
  let refreshPromise = null;

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
          onClearSession();
        }

        return Promise.reject(error);
      }

      if (!onRefreshSession) {
        onClearSession();
        return Promise.reject(error);
      }

      originalRequest._retry = true;

      try {
        if (!refreshPromise) {
          refreshPromise = onRefreshSession().finally(() => {
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
        onClearSession();
        return Promise.reject(refreshError);
      }
    }
  );
};

export const setupAuthInterceptors = (apiClient, handlers) => {
  attachAuthRequestInterceptor(apiClient);
  attachAuthResponseInterceptor(apiClient, handlers);
};
