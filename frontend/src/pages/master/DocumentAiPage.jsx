import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  CircularProgress,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Typography,
} from '@mui/material';
import AdminPage from '../../components/layout/AdminPage.jsx';
import DocumentAiUploadPanel from '../../components/features/documentAi/DocumentAiUploadPanel.jsx';
import * as tenantService from '../../services/tenant.service.js';

const DocumentAiPage = () => {
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tenantSubdomain, setTenantSubdomain] = useState('');

  const loadTenants = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const data = await tenantService.listTenants();
      setTenants(data);

      const enabled = data.filter((tenant) => tenant.addons?.documentAi && tenant.isActive);
      if (enabled.length === 1) {
        setTenantSubdomain(enabled[0].subdomain);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load tenants.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTenants();
  }, [loadTenants]);

  const selectableTenants = useMemo(
    () =>
      [...tenants]
        .filter((tenant) => tenant.isActive)
        .sort((a, b) => a.companyName.localeCompare(b.companyName)),
    [tenants]
  );

  return (
    <AdminPage
      title="Document AI"
      description="Test upload, OCR, parsing, history search/filters, and re-export for tenants."
    >
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          <FormControl fullWidth sx={{ mb: 3, maxWidth: 420 }}>
            <InputLabel id="document-ai-tenant-label">Tenant</InputLabel>
            <Select
              labelId="document-ai-tenant-label"
              label="Tenant"
              value={tenantSubdomain}
              onChange={(event) => setTenantSubdomain(event.target.value)}
            >
              <MenuItem value="">
                <em>Select a tenant</em>
              </MenuItem>
              {selectableTenants.map((tenant) => (
                <MenuItem key={tenant.tenantId} value={tenant.subdomain}>
                  {tenant.companyName}
                  {tenant.addons?.documentAi ? '' : ' (add-on off)'}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {!tenantSubdomain ? (
            <Typography variant="body2" color="text.secondary">
              Select a tenant to upload and review Document AI files.
            </Typography>
          ) : (
            <DocumentAiUploadPanel
              key={tenantSubdomain}
              tenantSubdomain={tenantSubdomain}
              emptyHint={`Uploading into tenant “${
                selectableTenants.find((tenant) => tenant.subdomain === tenantSubdomain)
                  ?.companyName || tenantSubdomain
              }”.`}
            />
          )}
        </>
      )}
    </AdminPage>
  );
};

export default DocumentAiPage;
