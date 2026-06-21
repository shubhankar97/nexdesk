import { Box, Chip, Divider, Typography } from '@mui/material';
import AdminPage from '../../components/layout/AdminPage.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { ROLE_LABELS } from '../../constants/roles.js';

const formatDate = (value) => {
  if (!value) return '—';

  return new Date(value).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

const ProfileField = ({ label, value }) => (
  <Box>
    <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
      {label}
    </Typography>
    <Typography variant="body1">{value}</Typography>
  </Box>
);

const ProfilePage = () => {
  const { user } = useAuth();

  const roleLabel = ROLE_LABELS[user?.role] || user?.role || '—';

  return (
    <AdminPage title="Profile" description="Your account information.">
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        <ProfileField label="Email" value={user?.email || '—'} />
        <Divider />
        <ProfileField label="Role" value={roleLabel} />
        <Divider />
        <Box>
          <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
            Status
          </Typography>
          <Chip
            label={user?.isActive ? 'Active' : 'Inactive'}
            color={user?.isActive ? 'success' : 'default'}
            size="small"
          />
        </Box>
        <Divider />
        <ProfileField label="Member since" value={formatDate(user?.createdAt)} />
      </Box>
    </AdminPage>
  );
};

export default ProfilePage;
