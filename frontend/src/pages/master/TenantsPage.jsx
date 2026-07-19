import { useCallback, useEffect, useMemo, useState } from 'react';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  IconButton,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import AdminPage from '../../components/layout/AdminPage.jsx';
import ConfirmDialog from '../../components/master/ConfirmDialog.jsx';
import * as tenantService from '../../services/tenant.service.js';
import { getTenantHost, getTenantZone } from '../../utils/subdomain.js';

const emptyForm = {
  companyName: '',
  subdomain: '',
  isActive: true,
  documentAi: false,
  documentAiPlanOverride: false,
};

const TenantsPage = () => {
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);

  const loadTenants = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const data = await tenantService.listTenants();
      setTenants(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load tenants.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTenants();
  }, [loadTenants]);

  const sortedTenants = useMemo(
    () => [...tenants].sort((a, b) => a.companyName.localeCompare(b.companyName)),
    [tenants]
  );

  const openCreateDialog = () => {
    setEditingId(null);
    setForm(emptyForm);
    setFormError('');
    setDialogOpen(true);
  };

  const openEditDialog = (tenant) => {
    setEditingId(tenant.tenantId);
    setForm({
      companyName: tenant.companyName,
      subdomain: tenant.subdomain,
      isActive: tenant.isActive,
      documentAi: Boolean(tenant.addons?.documentAi),
      documentAiPlanOverride: Boolean(tenant.addons?.documentAiPlanOverride),
    });
    setFormError('');
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.companyName.trim() || !form.subdomain.trim()) {
      setFormError('Company name and subdomain are required.');
      return;
    }

    setSaving(true);
    setFormError('');

    try {
      if (editingId) {
        await tenantService.updateTenant(editingId, {
          companyName: form.companyName.trim(),
          isActive: form.isActive,
          addons: {
            documentAi: form.documentAi,
            documentAiPlanOverride: form.documentAiPlanOverride,
          },
        });
      } else {
        await tenantService.createTenant({
          companyName: form.companyName.trim(),
          subdomain: form.subdomain.trim().toLowerCase(),
          isActive: form.isActive,
          addons: {
            documentAi: form.documentAi,
            documentAiPlanOverride: form.documentAiPlanOverride,
          },
        });
      }

      setDialogOpen(false);
      await loadTenants();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to save tenant.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) {
      return;
    }

    try {
      await tenantService.deleteTenant(deleteTarget.tenantId);
      setDeleteTarget(null);
      await loadTenants();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete tenant.');
      setDeleteTarget(null);
    }
  };

  return (
    <AdminPage
      title="Tenants"
      description="Manage onboarded tenants. Each tenant gets isolated users and orders in the database."
    >
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
        <Button variant="contained" startIcon={<AddIcon />} onClick={openCreateDialog}>
          Add Tenant
        </Button>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Company</TableCell>
                <TableCell>Subdomain</TableCell>
                <TableCell>Subscription</TableCell>
                <TableCell>Document AI</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {sortedTenants.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6}>
                    <Typography variant="body2" color="text.secondary" align="center" sx={{ py: 3 }}>
                      No tenants yet. Add your first tenant to get started.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                sortedTenants.map((tenant) => (
                  <TableRow key={tenant.tenantId} hover>
                    <TableCell>{tenant.companyName}</TableCell>
                    <TableCell>{getTenantHost(tenant.subdomain)}</TableCell>
                    <TableCell>{tenant.subscriptionStatus}</TableCell>
                    <TableCell>
                      <Chip
                        label={tenant.addons?.documentAi ? 'Enabled' : 'Off'}
                        color={tenant.addons?.documentAi ? 'primary' : 'default'}
                        size="small"
                        variant={tenant.addons?.documentAi ? 'filled' : 'outlined'}
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={tenant.isActive ? 'Active' : 'Inactive'}
                        color={tenant.isActive ? 'success' : 'default'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Tooltip title="Edit">
                        <IconButton size="small" onClick={() => openEditDialog(tenant)}>
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => setDeleteTarget(tenant)}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editingId ? 'Edit Tenant' : 'Add Tenant'}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Company Name"
            fullWidth
            required
            value={form.companyName}
            onChange={(event) => setForm((prev) => ({ ...prev, companyName: event.target.value }))}
          />
          <TextField
            margin="dense"
            label="Subdomain"
            fullWidth
            required
            disabled={Boolean(editingId)}
            value={form.subdomain}
            onChange={(event) => setForm((prev) => ({ ...prev, subdomain: event.target.value }))}
            helperText={
              editingId
                ? 'Subdomain cannot be changed after creation.'
                : `Used as subdomain.${getTenantZone()}`
            }
          />
          <FormControlLabel
            control={
              <Switch
                checked={form.isActive}
                onChange={(event) => setForm((prev) => ({ ...prev, isActive: event.target.checked }))}
              />
            }
            label="Active"
            sx={{ mt: 1 }}
          />
          <FormControlLabel
            control={
              <Switch
                checked={form.documentAi}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, documentAi: event.target.checked }))
                }
              />
            }
            label="Document AI add-on"
            sx={{ mt: 0.5 }}
          />
          <FormControlLabel
            control={
              <Switch
                checked={form.documentAiPlanOverride}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    documentAiPlanOverride: event.target.checked,
                  }))
                }
              />
            }
            label="Bypass plan feature (Master override)"
            sx={{ mt: 0.5 }}
          />
          {formError && (
            <Typography variant="body2" color="error" sx={{ mt: 1 }}>
              {formError}
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={handleSave} variant="contained" disabled={saving}>
            {saving ? 'Saving...' : editingId ? 'Save' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete Tenant"
        message={
          deleteTarget
            ? `Delete "${deleteTarget.companyName}"? This will remove its database collections and all tenant data.`
            : ''
        }
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
      />
    </AdminPage>
  );
};

export default TenantsPage;
