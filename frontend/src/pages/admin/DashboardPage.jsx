import { Box, Card, CardContent, Grid, Typography } from '@mui/material';
import AdminPage from '../../components/layout/AdminPage.jsx';

const statCards = [
  { label: 'Total Orders', value: '—' },
  { label: 'Active Customers', value: '—' },
  { label: 'Revenue', value: '—' },
  { label: 'Pending Tasks', value: '—' },
];

const DashboardPage = () => (
  <AdminPage
    title="Dashboard"
    description="Overview of your business activity."
  >
    <Grid container spacing={2}>
      {statCards.map((card) => (
        <Grid key={card.label} size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent sx={{ py: 2.5, '&:last-child': { pb: 2.5 } }}>
              <Typography variant="overline" color="text.secondary" display="block">
                {card.label}
              </Typography>
              <Typography variant="h4" fontWeight={700} sx={{ mt: 0.5 }}>
                {card.value}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
    <Box
      sx={{
        mt: 4,
        p: 3,
        borderRadius: 2,
        border: 1,
        borderColor: 'divider',
        bgcolor: 'background.default',
      }}
    >
      <Typography variant="body2" color="text.secondary">
        Dashboard widgets and charts will appear here.
      </Typography>
    </Box>
  </AdminPage>
);

export default DashboardPage;
