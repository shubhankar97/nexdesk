import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';
import AuthLoading from './guards/AuthLoading.jsx';

export const ProtectedRoute = ({ allowedRoles }) => {
  const { isAuthenticated, user, initializing } = useAuth();

  if (initializing) {
    return <AuthLoading />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles?.length && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
