import { useMemo, useState } from 'react';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import {
  Box,
  Button,
  Chip,
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
import { useMasterData } from '../../context/MasterDataContext.jsx';

const emptyForm = {
  companyName: '',
  subdomain: '',
  isActive: true,
  adminId: '',
};

const TenantsPage = () => {
  const {
    tenants,
    getAdminById,
    getCustomersByTenantId,
    getUnassignedAdmins,
    addTenant,
    updateTenant,
    deleteTenant,
  } = useMasterData();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState('');

  const adminOptions = useMemo(() => {
    const unassigned = getUnassignedAdmins();
    const currentAdmin = editingId ? getAdminById(tenants.find((t) => t.id === editingId)?.adminId) : null;
    return currentAdmin ? [currentAdmin, ...unassigned.filter((a) => a.id !== currentAdmin.id)] : unassigned;
  }, [editingId, getAdminById, getUnassignedAdmins, tenants]);

  const openCreateDialog = () => {
    setEditingId(null);
    setForm(emptyForm);
    setFormError('');
    setDialogOpen(true);
  };

  const openEditDialog = (tenant) => {
    setEditingId(tenant.id);
    setForm({
      companyName: tenant.companyName,
      subdomain: tenant.subdomain,
      isActive: tenant.isActive,
      adminId: tenant.adminId || '',
    });
    setFormError('');
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (!form.companyName.trim() || !form.subdomain.trim()) {
      setFormError('Company name and subdomain are required.');
      return;
    }

    const subdomainTaken = tenants.some(
      (tenant) =>
        tenant.subdomain.toLowerCase() === form.subdomain.trim().toLowerCase() &&
        tenant.id !== editingId
    );

    if (subdomainTaken) {
      setFormError('This subdomain is already in use.');
      return;
    }

    const payload = {
      companyName: form.companyName.trim(),
      subdomain: form.subdomain.trim().toLowerCase(),
      isActive: form.isActive,
      adminId: form.adminId || null,
    };

    if (editingId) {
      updateTenant(editingId, payload);
    } else {
      addTenant(payload);
    }

    setDialogOpen(false);
  };

  const handleDelete = () => {
    if (deleteTarget) {
      deleteTenant(deleteTarget.id);
      setDeleteTarget(null);
    }
  };

  return (
    <AdminPage
      title="Tenants"
      description="Manage onboarded tenants. Each tenant is linked to one admin."
    >
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
        <Button variant="contained" startIcon={<AddIcon />} onClick={openCreateDialog}>
          Add Tenant
        </Button>
      </Box>

      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Company</TableCell>
              <TableCell>Subdomain</TableCell>
              <TableCell>Admin</TableCell>
              <TableCell>Customers</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {tenants.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6}>
                  <Typography variant="body2" color="text.secondary" align="center" sx={{ py: 3 }}>
                    No tenants yet. Add your first tenant to get started.
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              tenants.map((tenant) => {
                const admin = getAdminById(tenant.adminId);
                const customerCount = getCustomersByTenantId(tenant.id).length;

                return (
                  <TableRow key={tenant.id} hover>
                    <TableCell>{tenant.companyName}</TableCell>
                    <TableCell>{tenant.subdomain}.coregent.com</TableCell>
                    <TableCell>{admin ? `${admin.name} (${admin.email})` : '—'}</TableCell>
                    <TableCell>{customerCount}</TableCell>
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
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>

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
            value={form.subdomain}
            onChange={(event) => setForm((prev) => ({ ...prev, subdomain: event.target.value }))}
            helperText="Used as subdomain.coregent.com"
          />
          <FormControl fullWidth margin="dense">
            <InputLabel id="tenant-admin-label">Assigned Admin</InputLabel>
            <Select
              labelId="tenant-admin-label"
              label="Assigned Admin"
              value={form.adminId}
              onChange={(event) => setForm((prev) => ({ ...prev, adminId: event.target.value }))}
            >
              <MenuItem value="">
                <em>None</em>
              </MenuItem>
              {adminOptions.map((admin) => (
                <MenuItem key={admin.id} value={admin.id}>
                  {admin.name} ({admin.email})
                </MenuItem>
              ))}
            </Select>
          </FormControl>
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
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleSave} variant="contained">
            {editingId ? 'Save' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete Tenant"
        message={
          deleteTarget
            ? `Delete "${deleteTarget.companyName}"? This will remove all customers under this tenant and unlink its admin.`
            : ''
        }
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
      />
    </AdminPage>
  );
};

export default TenantsPage;
