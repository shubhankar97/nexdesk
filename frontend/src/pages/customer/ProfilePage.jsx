import { Typography } from '@mui/material';
import AdminPage from '../../components/layout/AdminPage.jsx';

const ProfilePage = () => (
  <AdminPage
    title="Profile"
    description="Manage your personal information."
  >
    <Typography variant="body2" color="text.secondary">
      Profile details and preferences will appear here.
    </Typography>
  </AdminPage>
);

export default ProfilePage;
