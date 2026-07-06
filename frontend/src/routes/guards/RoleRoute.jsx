import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth.js';
import AuthLoading from './AuthLoading.jsx';

const RoleRoute = ({ allowedRoles, redirectTo = '/login' }) => {
  const { isAuthenticated, user, initializing } = useAuth();

  if (initializing) {
    return <AuthLoading />;
  }

  if (!isAuthenticated) {
    return <Navigate to={redirectTo} replace />;
  }

  if (allowedRoles?.length && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
};

export default RoleRoute;
