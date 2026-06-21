import { Typography } from '@mui/material';
import AdminPage from '../../components/layout/AdminPage.jsx';

const CustomersPage = () => (
  <AdminPage
    title="Customers"
    description="Browse and manage your customer base."
  >
    <Typography variant="body2" color="text.secondary">
      Customer directory and profiles will appear here.
    </Typography>
  </AdminPage>
);

export default CustomersPage;
