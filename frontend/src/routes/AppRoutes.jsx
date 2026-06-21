import { Navigate, Outlet, Route, Routes } from 'react-router-dom';
import { Box, CircularProgress } from '@mui/material';
import ProtectedRoute from './ProtectedRoute.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { ROLES } from '../constants/roles.js';
import { isTenantSubdomain } from '../utils/subdomain.js';
import LoginPage from '../pages/auth/LoginPage.jsx';
import MasterLoginPage from '../pages/auth/MasterLoginPage.jsx';
import ForgotPasswordPage from '../pages/auth/ForgotPasswordPage.jsx';
import ResetPasswordPage from '../pages/auth/ResetPasswordPage.jsx';
import AdminLayout from '../layouts/AdminLayout.jsx';
import CustomerLayout from '../layouts/CustomerLayout.jsx';
import MasterLayout from '../layouts/MasterLayout.jsx';
import DashboardPage from '../pages/admin/DashboardPage.jsx';
import OrdersPage from '../pages/admin/OrdersPage.jsx';
import CustomersPage from '../pages/admin/CustomersPage.jsx';
import ReportsPage from '../pages/admin/ReportsPage.jsx';
import NotificationsPage from '../pages/admin/NotificationsPage.jsx';
import SettingsPage from '../pages/admin/SettingsPage.jsx';
import CustomerDashboardPage from '../pages/customer/DashboardPage.jsx';
import CustomerOrdersPage from '../pages/customer/OrdersPage.jsx';
import CustomerDocumentsPage from '../pages/customer/DocumentsPage.jsx';
import CustomerNotificationsPage from '../pages/customer/NotificationsPage.jsx';
import CustomerProfilePage from '../pages/customer/ProfilePage.jsx';
import AdminProfilePage from '../pages/admin/ProfilePage.jsx';
import MasterProfilePage from '../pages/master/ProfilePage.jsx';
import MasterDashboardPage from '../pages/master/DashboardPage.jsx';
import MasterTenantsPage from '../pages/master/TenantsPage.jsx';
import MasterAdminsPage from '../pages/master/AdminsPage.jsx';
import MasterCustomersPage from '../pages/master/CustomersPage.jsx';

const getHomePath = (role) => {
  if (role === ROLES.CUSTOMER) return '/portal';
  if (role === ROLES.MASTER) {
    return isTenantSubdomain() ? null : '/master';
  }
  return '/';
};

const PlatformOnlyRoute = () => {
  if (isTenantSubdomain()) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

const AuthLoading = () => (
  <Box
    sx={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}
  >
    <CircularProgress />
  </Box>
);

const PublicOnlyRoute = ({ children }) => {
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

const AdminHomeRoute = () => {
  const { user } = useAuth();

  if (user?.role === ROLES.CUSTOMER) {
    return <Navigate to="/portal" replace />;
  }

  if (user?.role === ROLES.MASTER) {
    return <Navigate to={isTenantSubdomain() ? '/login' : '/master'} replace />;
  }

  return <DashboardPage />;
};

const MasterShell = () => {
  const { isAuthenticated, user, initializing } = useAuth();

  if (initializing) {
    return <AuthLoading />;
  }

  if (!isAuthenticated) {
    return <MasterLoginPage />;
  }

  if (user?.role !== ROLES.MASTER) {
    return <Navigate to="/login" replace />;
  }

  return <MasterLayout />;
};

const AppRoutes = () => {
  const { initializing } = useAuth();

  if (initializing) {
    return <AuthLoading />;
  }

  return (
    <Routes>
      <Route
        path="/login"
        element={
          <PublicOnlyRoute>
            <LoginPage />
          </PublicOnlyRoute>
        }
      />
      <Route
        path="/forgot-password"
        element={
          <PublicOnlyRoute>
            <ForgotPasswordPage />
          </PublicOnlyRoute>
        }
      />
      <Route
        path="/reset-password"
        element={
          <PublicOnlyRoute>
            <ResetPasswordPage />
          </PublicOnlyRoute>
        }
      />

      <Route element={<ProtectedRoute />}>
        <Route element={<AdminLayout />}>
          <Route path="/" element={<AdminHomeRoute />} />
          <Route path="/orders" element={<OrdersPage />} />
          <Route path="/customers" element={<CustomersPage />} />
          <Route path="/reports" element={<ReportsPage />} />
          <Route path="/notifications" element={<NotificationsPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/profile" element={<AdminProfilePage />} />
        </Route>

        <Route element={<CustomerLayout />}>
          <Route path="/portal" element={<CustomerDashboardPage />} />
          <Route path="/portal/orders" element={<CustomerOrdersPage />} />
          <Route path="/portal/documents" element={<CustomerDocumentsPage />} />
          <Route path="/portal/notifications" element={<CustomerNotificationsPage />} />
          <Route path="/portal/profile" element={<CustomerProfilePage />} />
        </Route>
      </Route>

      <Route path="/master" element={<PlatformOnlyRoute />}>
        <Route element={<MasterShell />}>
          <Route index element={<MasterDashboardPage />} />
          <Route path="tenants" element={<MasterTenantsPage />} />
          <Route path="admins" element={<MasterAdminsPage />} />
          <Route path="customers" element={<MasterCustomersPage />} />
          <Route path="profile" element={<MasterProfilePage />} />
        </Route>
      </Route>
    </Routes>
  );
};

export default AppRoutes;
