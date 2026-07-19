import AdminPage from '../../components/layout/AdminPage.jsx';
import DocumentAiUploadPanel from '../../components/features/documentAi/DocumentAiUploadPanel.jsx';

const DocumentAiPage = () => (
  <AdminPage
    title="Document AI"
    description="Upload invoices, then search history, view results, and re-export CSV/Excel."
  >
    <DocumentAiUploadPanel />
  </AdminPage>
);

export default DocumentAiPage;
