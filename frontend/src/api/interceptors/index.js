import { setupAuthInterceptors } from './authInterceptor.js';

export { attachAuthRequestInterceptor, attachAuthResponseInterceptor } from './authInterceptor.js';

export const configureApiClient = (apiClient, handlers) => {
  setupAuthInterceptors(apiClient, handlers);
};
