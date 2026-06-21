import { Typography } from '@mui/material';
import AdminPage from '../../components/layout/AdminPage.jsx';

const OrdersPage = () => (
  <AdminPage
    title="Orders"
    description="View and manage customer orders."
  >
    <Typography variant="body2" color="text.secondary">
      Order list and management tools will appear here.
    </Typography>
  </AdminPage>
);

export default OrdersPage;
