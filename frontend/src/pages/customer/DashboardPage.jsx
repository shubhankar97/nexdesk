import { Grid, Typography } from '@mui/material';
import AdminPage from '../../components/layout/AdminPage.jsx';

const statCards = [
  { label: 'Open Orders', value: '—' },
  { label: 'Documents', value: '—' },
  { label: 'Unread Notifications', value: '—' },
];

const DashboardPage = () => (
  <AdminPage
    title="Dashboard"
    description="Your account overview at a glance."
  >
    <Grid container spacing={2}>
      {statCards.map((card) => (
        <Grid key={card.label} size={{ xs: 12, sm: 4 }}>
          <Typography variant="overline" color="text.secondary">
            {card.label}
          </Typography>
          <Typography variant="h4" fontWeight={600}>
            {card.value}
          </Typography>
        </Grid>
      ))}
    </Grid>
    <Typography variant="body2" color="text.secondary" sx={{ mt: 4 }}>
      Recent activity and updates will appear here.
    </Typography>
  </AdminPage>
);

export default DashboardPage;
