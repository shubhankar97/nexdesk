import { useCallback, useEffect, useState } from 'react';
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
  FormControl,
  FormControlLabel,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
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
import * as adminService from '../../services/admin.service.js';
import * as tenantService from '../../services/tenant.service.js';

const emptyForm = {
  email: '',
  password: '',
  isActive: true,
  tenantId: '',
};

const AdminsPage = () => {
  const [admins, setAdmins] = useState([]);
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [editingAdmin, setEditingAdmin] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const [tenantData, adminData] = await Promise.all([
        tenantService.listTenants(),
        adminService.listAdmins(),
      ]);
      setTenants(tenantData);
      setAdmins(adminData);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load admins.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const openCreateDialog = () => {
    setEditingAdmin(null);
    setForm(emptyForm);
    setFormError('');
    setDialogOpen(true);
  };

  const openEditDialog = (admin) => {
    setEditingAdmin(admin);
    setForm({
      email: admin.email,
      password: '',
      isActive: admin.isActive,
      tenantId: admin.tenantId,
    });
    setFormError('');
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.email.trim() || !form.tenantId) {
      setFormError('Email and tenant are required.');
      return;
    }

    if (!editingAdmin && !form.password.trim()) {
      setFormError('Password is required for new admins.');
      return;
    }

    setSaving(true);
    setFormError('');

    try {
      if (editingAdmin) {
        const payload = {
          email: form.email.trim().toLowerCase(),
          isActive: form.isActive,
        };

        if (form.password.trim()) {
          payload.password = form.password;
        }

        await adminService.updateAdmin(editingAdmin.tenantId, editingAdmin.id, payload);
      } else {
        await adminService.createAdmin({
          tenantId: form.tenantId,
          email: form.email.trim().toLowerCase(),
          password: form.password,
          isActive: form.isActive,
        });
      }

      setDialogOpen(false);
      await loadData();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to save admin.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) {
      return;
    }

    try {
      await adminService.deleteAdmin(deleteTarget.tenantId, deleteTarget.id);
      setDeleteTarget(null);
      await loadData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete admin.');
      setDeleteTarget(null);
    }
  };

  return (
    <AdminPage
      title="Admins"
      description="Manage tenant administrators. Each admin belongs to one tenant."
    >
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={openCreateDialog}
          disabled={tenants.length === 0}
        >
          Add Admin
        </Button>
      </Box>

      {tenants.length === 0 && !loading && (
        <Alert severity="info" sx={{ mb: 2 }}>
          Create a tenant first before adding admins.
        </Alert>
      )}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Email</TableCell>
                <TableCell>Tenant</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {admins.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4}>
                    <Typography variant="body2" color="text.secondary" align="center" sx={{ py: 3 }}>
                      No admins yet. Add an admin and assign them to a tenant.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                admins.map((admin) => (
                  <TableRow key={`${admin.tenantId}-${admin.id}`} hover>
                    <TableCell>{admin.email}</TableCell>
                    <TableCell>{admin.tenantName || '—'}</TableCell>
                    <TableCell>
                      <Chip
                        label={admin.isActive ? 'Active' : 'Inactive'}
                        color={admin.isActive ? 'success' : 'default'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Tooltip title="Edit">
                        <IconButton size="small" onClick={() => openEditDialog(admin)}>
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => setDeleteTarget(admin)}
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
        <DialogTitle>{editingAdmin ? 'Edit Admin' : 'Add Admin'}</DialogTitle>
        <DialogContent>
          <FormControl fullWidth margin="dense" required>
            <InputLabel id="admin-tenant-label">Assigned Tenant</InputLabel>
            <Select
              labelId="admin-tenant-label"
              label="Assigned Tenant"
              value={form.tenantId}
              disabled={Boolean(editingAdmin)}
              onChange={(event) => setForm((prev) => ({ ...prev, tenantId: event.target.value }))}
            >
              {tenants.map((tenant) => (
                <MenuItem key={tenant.tenantId} value={tenant.tenantId}>
                  {tenant.companyName}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            autoFocus
            margin="dense"
            label="Email"
            type="email"
            fullWidth
            required
            value={form.email}
            onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
          />
          <TextField
            margin="dense"
            label={editingAdmin ? 'New Password (optional)' : 'Password'}
            type="password"
            fullWidth
            required={!editingAdmin}
            value={form.password}
            onChange={(event) => setForm((prev) => ({ ...prev, password: event.target.value }))}
            helperText={editingAdmin ? 'Leave blank to keep current password' : 'Minimum 8 characters'}
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
            {saving ? 'Saving...' : editingAdmin ? 'Save' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete Admin"
        message={
          deleteTarget ? `Delete "${deleteTarget.email}"? This cannot be undone.` : ''
        }
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
      />
    </AdminPage>
  );
};

export default AdminsPage;
