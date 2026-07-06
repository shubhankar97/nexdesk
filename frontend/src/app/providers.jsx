import { useEffect } from 'react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { initializeApiClient } from '../api/client.js';
import { ThemeProvider } from '../context/ThemeContext.jsx';
import { bootstrapAuth, logout, refreshSession } from '../features/auth/index.js';
import { store } from '../store/index.js';

const ApiClientBridge = () => {
  useEffect(() => {
    initializeApiClient({
      onRefreshSession: async () => {
        try {
          const result = await store.dispatch(refreshSession()).unwrap();
          return result?.token ?? null;
        } catch {
          return null;
        }
      },
      onClearSession: () => {
        store.dispatch(logout());
      },
    });
  }, []);

  return null;
};

const AuthBootstrap = () => {
  useEffect(() => {
    store.dispatch(bootstrapAuth());
  }, []);

  return null;
};

export const AppProviders = ({ children }) => (
  <Provider store={store}>
    <ThemeProvider>
      <BrowserRouter>
        <ApiClientBridge />
        <AuthBootstrap />
        {children}
      </BrowserRouter>
    </ThemeProvider>
  </Provider>
);
