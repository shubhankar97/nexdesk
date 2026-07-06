import { Navigate } from 'react-router-dom';
import { ROLES } from '../../constants/roles.js';
import { useAuth } from '../../hooks/useAuth.js';
import { isTenantSubdomain } from '../../utils/subdomain.js';
import AuthLoading from './AuthLoading.jsx';

const getHomePath = (role) => {
  if (role === ROLES.CUSTOMER) return '/portal';
  if (role === ROLES.MASTER) {
    return isTenantSubdomain() ? null : '/master';
  }
  return '/';
};

const GuestRoute = ({ children }) => {
  const { isAuthenticated, initializing, user, logout } = useAuth();

  if (initializing) {
    return <AuthLoading />;
  }

  if (isAuthenticated) {
    if (user?.role === ROLES.MASTER && isTenantSubdomain()) {
      logout();
      return children;
    }

    const homePath = getHomePath(user?.role);

    if (homePath) {
      return <Navigate to={homePath} replace />;
    }
  }

  return children;
};

export default GuestRoute;
