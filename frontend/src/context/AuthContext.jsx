import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import * as authService from '../services/auth.service.js';

const AuthContext = createContext(null);

const TOKEN_KEY = 'token';
const REFRESH_TOKEN_KEY = 'refreshToken';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY));
  const [refreshToken, setRefreshToken] = useState(() =>
    localStorage.getItem(REFRESH_TOKEN_KEY)
  );
  const [initializing, setInitializing] = useState(Boolean(localStorage.getItem(TOKEN_KEY)));

  const isAuthenticated = Boolean(token);

  const login = (accessToken, newRefreshToken, userData) => {
    localStorage.setItem(TOKEN_KEY, accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, newRefreshToken);
    setToken(accessToken);
    setRefreshToken(newRefreshToken);
    setUser(userData);
  };

  const logout = useCallback(async () => {
    try {
      if (localStorage.getItem(TOKEN_KEY)) {
        await authService.logout();
      }
    } catch {
      // Ignore logout errors; clear local session regardless.
    } finally {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(REFRESH_TOKEN_KEY);
      setToken(null);
      setRefreshToken(null);
      setUser(null);
    }
  }, []);

  const refreshSession = useCallback(async () => {
    const storedRefreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);

    if (!storedRefreshToken) {
      await logout();
      return null;
    }

    const result = await authService.refreshTokens(storedRefreshToken);
    login(result.accessToken, result.refreshToken, result.user);
    return result.accessToken;
  }, [logout]);

  useEffect(() => {
    const bootstrap = async () => {
      if (!token) {
        setInitializing(false);
        return;
      }

      try {
        const currentUser = await authService.getMe();
        setUser(currentUser);
      } catch {
        try {
          await refreshSession();
        } catch {
          await logout();
        }
      } finally {
        setInitializing(false);
      }
    };

    bootstrap();
  }, [token, refreshSession, logout]);

  const value = useMemo(
    () => ({
      user,
      token,
      refreshToken,
      isAuthenticated,
      initializing,
      login,
      logout,
      refreshSession,
    }),
    [user, token, refreshToken, isAuthenticated, initializing, logout, refreshSession]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
};
