import { Typography } from '@mui/material';
import AdminPage from '../../components/layout/AdminPage.jsx';

const NotificationsPage = () => (
  <AdminPage
    title="Notifications"
    description="Stay updated on important events."
  >
    <Typography variant="body2" color="text.secondary">
      Notification feed and preferences will appear here.
    </Typography>
  </AdminPage>
);

export default NotificationsPage;
