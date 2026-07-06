export const env = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1',
  rootDomain: import.meta.env.VITE_ROOT_DOMAIN || 'localhost',
  appSubdomain: import.meta.env.VITE_APP_SUBDOMAIN || 'nexdesk',
};
