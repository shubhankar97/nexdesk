import { Navigate, Route, Routes } from 'react-router-dom';
import { MODULES } from '../constants/modules.js';
import { ROLES } from '../constants/roles.js';
import { useAuth } from '../hooks/useAuth.js';
import { isTenantSubdomain } from '../utils/subdomain.js';
import LoginPage from '../pages/auth/LoginPage.jsx';
import ForgotPasswordPage from '../pages/auth/ForgotPasswordPage.jsx';
import ResetPasswordPage from '../pages/auth/ResetPasswordPage.jsx';
import UnauthorizedPage from '../pages/UnauthorizedPage.jsx';
import AdminLayout from '../layouts/AdminLayout.jsx';
import CustomerLayout from '../layouts/CustomerLayout.jsx';
import MasterLayout from '../layouts/MasterLayout.jsx';
import DashboardPage from '../pages/admin/DashboardPage.jsx';
import OrdersPage from '../pages/admin/OrdersPage.jsx';
import CustomersPage from '../pages/admin/CustomersPage.jsx';
import ReportsPage from '../pages/admin/ReportsPage.jsx';
import DocumentAiPage from '../pages/admin/DocumentAiPage.jsx';
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
import MasterDocumentAiPage from '../pages/master/DocumentAiPage.jsx';
import MasterLoginPage from '../pages/auth/MasterLoginPage.jsx';
import ProtectedRoute from './ProtectedRoute.jsx';
import { AuthLoading, GuestRoute, ModuleRoute, RoleRoute, TenantRoute } from './guards/index.js';

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
          <GuestRoute>
            <LoginPage />
          </GuestRoute>
        }
      />
      <Route
        path="/forgot-password"
        element={
          <GuestRoute>
            <ForgotPasswordPage />
          </GuestRoute>
        }
      />
      <Route
        path="/reset-password"
        element={
          <GuestRoute>
            <ResetPasswordPage />
          </GuestRoute>
        }
      />
      <Route path="/unauthorized" element={<UnauthorizedPage />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<AdminLayout />}>
          <Route path="/" element={<AdminHomeRoute />} />
          <Route path="/orders" element={<OrdersPage />} />
          <Route path="/customers" element={<CustomersPage />} />
          <Route path="/reports" element={<ReportsPage />} />
          <Route element={<RoleRoute allowedRoles={[ROLES.ADMIN]} />}>
            <Route element={<ModuleRoute module={MODULES.DOCUMENT_AI} />}>
              <Route path="/document-ai" element={<DocumentAiPage />} />
            </Route>
          </Route>
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

      <Route path="/master" element={<TenantRoute requirePlatform />}>
        <Route element={<MasterShell />}>
          <Route index element={<MasterDashboardPage />} />
          <Route path="tenants" element={<MasterTenantsPage />} />
          <Route path="admins" element={<MasterAdminsPage />} />
          <Route path="customers" element={<MasterCustomersPage />} />
          <Route path="document-ai" element={<MasterDocumentAiPage />} />
          <Route path="profile" element={<MasterProfilePage />} />
        </Route>
      </Route>
    </Routes>
  );
};

export default AppRoutes;
