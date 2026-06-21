import { Typography } from '@mui/material';
import AdminPage from '../../components/layout/AdminPage.jsx';

const DocumentsPage = () => (
  <AdminPage
    title="Documents"
    description="Access invoices, contracts, and files."
  >
    <Typography variant="body2" color="text.secondary">
      Your documents will appear here.
    </Typography>
  </AdminPage>
);

export default DocumentsPage;
