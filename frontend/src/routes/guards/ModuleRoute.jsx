import { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { hasModuleAccess } from '../../constants/modules.js';
import { useAuth } from '../../hooks/useAuth.js';
import * as tenantService from '../../services/tenant.service.js';
import AuthLoading from './AuthLoading.jsx';

const ModuleRoute = ({ module: moduleKey }) => {
  const { isAuthenticated, initializing } = useAuth();
  const [loading, setLoading] = useState(true);
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const loadAccess = async () => {
      if (initializing) {
        return;
      }

      if (!isAuthenticated) {
        if (!cancelled) {
          setAllowed(false);
          setLoading(false);
        }
        return;
      }

      setLoading(true);

      try {
        const tenant = await tenantService.getCurrentTenant();
        if (!cancelled) {
          setAllowed(hasModuleAccess(tenant, moduleKey));
        }
      } catch {
        if (!cancelled) {
          setAllowed(false);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadAccess();

    return () => {
      cancelled = true;
    };
  }, [initializing, isAuthenticated, moduleKey]);

  if (initializing || loading) {
    return <AuthLoading />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!allowed) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
};

export default ModuleRoute;
