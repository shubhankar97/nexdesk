import { useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';

const AuthSessionBridge = () => {
  const { refreshSession } = useAuth();

  useEffect(() => {
    window.__nexdeskRefreshSession = refreshSession;

    return () => {
      delete window.__nexdeskRefreshSession;
    };
  }, [refreshSession]);

  return null;
};

export default AuthSessionBridge;
