import { Navigate, Route, Routes } from 'react-router-dom';
import { Box, CircularProgress } from '@mui/material';
import ProtectedRoute from './ProtectedRoute.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { ROLES } from '../constants/roles.js';
import LoginPage from '../pages/auth/LoginPage.jsx';
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
import MasterDashboardPage from '../pages/master/DashboardPage.jsx';
import MasterTenantsPage from '../pages/master/TenantsPage.jsx';
import MasterAdminsPage from '../pages/master/AdminsPage.jsx';
import MasterCustomersPage from '../pages/master/CustomersPage.jsx';

const getHomePath = (role) => {
  if (role === ROLES.CUSTOMER) return '/portal';
  if (role === ROLES.MASTER) return '/master';
  return '/';
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
  const { isAuthenticated, initializing, user } = useAuth();

  if (initializing) {
    return <AuthLoading />;
  }

  if (isAuthenticated) {
    return <Navigate to={getHomePath(user?.role)} replace />;
  }

  return children;
};

const AdminHomeRoute = () => {
  const { user } = useAuth();

  if (user?.role === ROLES.CUSTOMER) {
    return <Navigate to="/portal" replace />;
  }

  if (user?.role === ROLES.MASTER) {
    return <Navigate to="/master" replace />;
  }

  return <DashboardPage />;
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
        </Route>

        <Route element={<CustomerLayout />}>
          <Route path="/portal" element={<CustomerDashboardPage />} />
          <Route path="/portal/orders" element={<CustomerOrdersPage />} />
          <Route path="/portal/documents" element={<CustomerDocumentsPage />} />
          <Route path="/portal/notifications" element={<CustomerNotificationsPage />} />
          <Route path="/portal/profile" element={<CustomerProfilePage />} />
        </Route>

        <Route element={<MasterLayout />}>
          <Route path="/master" element={<MasterDashboardPage />} />
          <Route path="/master/tenants" element={<MasterTenantsPage />} />
          <Route path="/master/admins" element={<MasterAdminsPage />} />
          <Route path="/master/customers" element={<MasterCustomersPage />} />
        </Route>
      </Route>
    </Routes>
  );
};

export default AppRoutes;
