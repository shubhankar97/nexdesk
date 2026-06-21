import { Typography } from '@mui/material';
import AdminPage from '../../components/layout/AdminPage.jsx';

const OrdersPage = () => (
  <AdminPage
    title="Orders"
    description="Track and review your orders."
  >
    <Typography variant="body2" color="text.secondary">
      Your order history will appear here.
    </Typography>
  </AdminPage>
);

export default OrdersPage;
