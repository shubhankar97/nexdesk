import { Typography } from '@mui/material';
import AdminPage from '../../components/layout/AdminPage.jsx';

const SettingsPage = () => (
  <AdminPage
    title="Settings"
    description="Configure your admin preferences."
  >
    <Typography variant="body2" color="text.secondary">
      Account and application settings will appear here.
    </Typography>
  </AdminPage>
);

export default SettingsPage;
