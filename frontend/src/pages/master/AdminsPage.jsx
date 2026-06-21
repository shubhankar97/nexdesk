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
  name: '',
  email: '',
  isActive: true,
  tenantId: '',
};

const AdminsPage = () => {
  const {
    admins,
    tenants,
    getTenantById,
    getCustomersByTenantId,
    getTenantsWithoutAdmin,
    addAdmin,
    updateAdmin,
    deleteAdmin,
  } = useMasterData();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState('');

  const tenantOptions = useMemo(() => {
    const unassigned = getTenantsWithoutAdmin();
    const currentTenant = editingId
      ? tenants.find((tenant) => tenant.adminId === editingId)
      : null;
    return currentTenant
      ? [currentTenant, ...unassigned.filter((tenant) => tenant.id !== currentTenant.id)]
      : unassigned;
  }, [editingId, getTenantsWithoutAdmin, tenants]);

  const openCreateDialog = () => {
    setEditingId(null);
    setForm(emptyForm);
    setFormError('');
    setDialogOpen(true);
  };

  const openEditDialog = (admin) => {
    setEditingId(admin.id);
    setForm({
      name: admin.name,
      email: admin.email,
      isActive: admin.isActive,
      tenantId: admin.tenantId || '',
    });
    setFormError('');
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (!form.name.trim() || !form.email.trim()) {
      setFormError('Name and email are required.');
      return;
    }

    const emailTaken = admins.some(
      (admin) => admin.email.toLowerCase() === form.email.trim().toLowerCase() && admin.id !== editingId
    );

    if (emailTaken) {
      setFormError('This email is already in use.');
      return;
    }

    const payload = {
      name: form.name.trim(),
      email: form.email.trim().toLowerCase(),
      isActive: form.isActive,
      tenantId: form.tenantId || null,
    };

    if (editingId) {
      updateAdmin(editingId, payload);
    } else {
      addAdmin(payload);
    }

    setDialogOpen(false);
  };

  const handleDelete = () => {
    if (deleteTarget) {
      deleteAdmin(deleteTarget.id);
      setDeleteTarget(null);
    }
  };

  return (
    <AdminPage
      title="Admins"
      description="Manage tenant administrators. Each admin is linked to one tenant."
    >
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
        <Button variant="contained" startIcon={<AddIcon />} onClick={openCreateDialog}>
          Add Admin
        </Button>
      </Box>

      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Tenant</TableCell>
              <TableCell>Users</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {admins.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6}>
                  <Typography variant="body2" color="text.secondary" align="center" sx={{ py: 3 }}>
                    No admins yet. Add an admin and assign them to a tenant.
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              admins.map((admin) => {
                const tenant = getTenantById(admin.tenantId);
                const userCount = admin.tenantId
                  ? getCustomersByTenantId(admin.tenantId).length
                  : 0;

                return (
                  <TableRow key={admin.id} hover>
                    <TableCell>{admin.name}</TableCell>
                    <TableCell>{admin.email}</TableCell>
                    <TableCell>{tenant ? tenant.companyName : '—'}</TableCell>
                    <TableCell>{userCount}</TableCell>
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
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editingId ? 'Edit Admin' : 'Add Admin'}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Name"
            fullWidth
            required
            value={form.name}
            onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
          />
          <TextField
            margin="dense"
            label="Email"
            type="email"
            fullWidth
            required
            value={form.email}
            onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
          />
          <FormControl fullWidth margin="dense">
            <InputLabel id="admin-tenant-label">Assigned Tenant</InputLabel>
            <Select
              labelId="admin-tenant-label"
              label="Assigned Tenant"
              value={form.tenantId}
              onChange={(event) => setForm((prev) => ({ ...prev, tenantId: event.target.value }))}
            >
              <MenuItem value="">
                <em>None</em>
              </MenuItem>
              {tenantOptions.map((tenant) => (
                <MenuItem key={tenant.id} value={tenant.id}>
                  {tenant.companyName}
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
        title="Delete Admin"
        message={
          deleteTarget
            ? `Delete "${deleteTarget.name}"? This will unlink them from their tenant.`
            : ''
        }
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
      />
    </AdminPage>
  );
};

export default AdminsPage;
