import { useCallback, useEffect, useState } from 'react';
import { Alert, Box, Card, CardContent, Grid, Typography } from '@mui/material';
import AdminPage from '../../components/layout/AdminPage.jsx';
import DocumentAiUsageCard from '../../components/features/documentAi/DocumentAiUsageCard.jsx';
import { hasModuleAccess, MODULES } from '../../constants/modules.js';
import * as documentService from '../../services/document.service.js';
import * as tenantService from '../../services/tenant.service.js';

const statCards = [
  { label: 'Total Orders', value: '—' },
  { label: 'Active Customers', value: '—' },
  { label: 'Revenue', value: '—' },
  { label: 'Pending Tasks', value: '—' },
];

const DashboardPage = () => {
  const [tenant, setTenant] = useState(null);
  const [usage, setUsage] = useState(null);
  const [usageLoading, setUsageLoading] = useState(false);
  const [error, setError] = useState('');

  const loadDashboard = useCallback(async () => {
    setError('');

    try {
      const currentTenant = await tenantService.getCurrentTenant();
      setTenant(currentTenant);

      if (!hasModuleAccess(currentTenant, MODULES.DOCUMENT_AI)) {
        setUsage(null);
        return;
      }

      setUsageLoading(true);
      const usageData = await documentService.getDocumentAiUsage();
      setUsage(usageData);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load dashboard usage.');
      setUsage(null);
    } finally {
      setUsageLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const showDocumentAi = hasModuleAccess(tenant, MODULES.DOCUMENT_AI);

  return (
    <AdminPage title="Dashboard" description="Overview of your business activity.">
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

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

      {showDocumentAi && (
        <Box sx={{ mt: 3 }}>
          <DocumentAiUsageCard usage={usage} loading={usageLoading} />
        </Box>
      )}

      {!showDocumentAi && (
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
            Dashboard widgets and charts will appear here. Document AI usage appears when the
            add-on and plan feature are enabled.
          </Typography>
        </Box>
      )}
    </AdminPage>
  );
};

export default DashboardPage;
