import { Grid, Typography } from '@mui/material';
import AdminPage from '../../components/layout/AdminPage.jsx';
import { useMasterData } from '../../context/MasterDataContext.jsx';

const DashboardPage = () => {
  const { tenants, admins, customers } = useMasterData();

  const statCards = [
    { label: 'Tenants', value: tenants.length },
    { label: 'Admins', value: admins.length },
    { label: 'Customers', value: customers.length },
    {
      label: 'Active Tenants',
      value: tenants.filter((tenant) => tenant.isActive).length,
    },
  ];

  return (
    <AdminPage
      title="Dashboard"
      description="Platform overview across all tenants."
    >
      <Grid container spacing={2}>
        {statCards.map((card) => (
          <Grid key={card.label} size={{ xs: 12, sm: 6, md: 3 }}>
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
        Each tenant is linked to one admin. Admins can have multiple customer users under their
        tenant.
      </Typography>
    </AdminPage>
  );
};

export default DashboardPage;
