import { Typography } from '@mui/material';
import AdminPage from '../../components/layout/AdminPage.jsx';

const ReportsPage = () => (
  <AdminPage
    title="Reports"
    description="Analyze performance and export data."
  >
    <Typography variant="body2" color="text.secondary">
      Reports and analytics will appear here.
    </Typography>
  </AdminPage>
);

export default ReportsPage;
