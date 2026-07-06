import { useCallback } from 'react';
import {
  logout,
  refreshSession,
  selectAuthInitializing,
  selectIsAuthenticated,
  selectRefreshToken,
  selectToken,
  selectUser,
  setSession,
} from '../features/auth/index.js';
import { useAppDispatch } from './useAppDispatch.js';
import { useAppSelector } from './useAppSelector.js';

export const useAuth = () => {
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectUser);
  const token = useAppSelector(selectToken);
  const refreshTokenValue = useAppSelector(selectRefreshToken);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const initializing = useAppSelector(selectAuthInitializing);

  const login = useCallback(
    (accessToken, newRefreshToken, userData) => {
      dispatch(
        setSession({
          accessToken,
          refreshToken: newRefreshToken,
          user: userData,
        })
      );
    },
    [dispatch]
  );

  const handleLogout = useCallback(async () => {
    await dispatch(logout()).unwrap();
  }, [dispatch]);

  const handleRefreshSession = useCallback(async () => {
    try {
      const result = await dispatch(refreshSession()).unwrap();
      return result?.token ?? null;
    } catch {
      return null;
    }
  }, [dispatch]);

  return {
    user,
    token,
    refreshToken: refreshTokenValue,
    isAuthenticated,
    initializing,
    login,
    logout: handleLogout,
    refreshSession: handleRefreshSession,
  };
};
