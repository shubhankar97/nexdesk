import { Navigate, Outlet } from 'react-router-dom';
import { isTenantSubdomain } from '../../utils/subdomain.js';

const TenantRoute = ({ requirePlatform = false, redirectTo = '/login' }) => {
  const onTenantHost = isTenantSubdomain();

  if (requirePlatform && onTenantHost) {
    return <Navigate to={redirectTo} replace />;
  }

  if (!requirePlatform && !onTenantHost) {
    return <Navigate to={redirectTo} replace />;
  }

  return <Outlet />;
};

export default TenantRoute;
