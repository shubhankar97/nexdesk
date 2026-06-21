import { Typography } from '@mui/material';
import AdminPage from '../../components/layout/AdminPage.jsx';

const NotificationsPage = () => (
  <AdminPage
    title="Notifications"
    description="Updates about your account and orders."
  >
    <Typography variant="body2" color="text.secondary">
      Your notifications will appear here.
    </Typography>
  </AdminPage>
);

export default NotificationsPage;
