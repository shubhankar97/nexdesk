import { useState } from 'react';
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

const CustomersPage = () => {
  const {
    customers,
    tenants,
    getTenantById,
    getAdminById,
    addCustomer,
    updateCustomer,
    deleteCustomer,
  } = useMasterData();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState('');

  const openCreateDialog = () => {
    setEditingId(null);
    setForm(emptyForm);
    setFormError('');
    setDialogOpen(true);
  };

  const openEditDialog = (customer) => {
    setEditingId(customer.id);
    setForm({
      name: customer.name,
      email: customer.email,
      isActive: customer.isActive,
      tenantId: customer.tenantId,
    });
    setFormError('');
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (!form.name.trim() || !form.email.trim() || !form.tenantId) {
      setFormError('Name, email, and tenant are required.');
      return;
    }

    const emailTaken = customers.some(
      (customer) =>
        customer.email.toLowerCase() === form.email.trim().toLowerCase() &&
        customer.id !== editingId
    );

    if (emailTaken) {
      setFormError('This email is already in use.');
      return;
    }

    const payload = {
      name: form.name.trim(),
      email: form.email.trim().toLowerCase(),
      isActive: form.isActive,
      tenantId: form.tenantId,
    };

    if (editingId) {
      updateCustomer(editingId, payload);
    } else {
      addCustomer(payload);
    }

    setDialogOpen(false);
  };

  const handleDelete = () => {
    if (deleteTarget) {
      deleteCustomer(deleteTarget.id);
      setDeleteTarget(null);
    }
  };

  return (
    <AdminPage
      title="Customers"
      description="Manage customer users. Each customer belongs to a tenant under an admin."
    >
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
        <Button variant="contained" startIcon={<AddIcon />} onClick={openCreateDialog}>
          Add Customer
        </Button>
      </Box>

      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Tenant</TableCell>
              <TableCell>Admin</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {customers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6}>
                  <Typography variant="body2" color="text.secondary" align="center" sx={{ py: 3 }}>
                    No customers yet. Add a customer and assign them to a tenant.
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              customers.map((customer) => {
                const tenant = getTenantById(customer.tenantId);
                const admin = tenant ? getAdminById(tenant.adminId) : null;

                return (
                  <TableRow key={customer.id} hover>
                    <TableCell>{customer.name}</TableCell>
                    <TableCell>{customer.email}</TableCell>
                    <TableCell>{tenant ? tenant.companyName : '—'}</TableCell>
                    <TableCell>{admin ? admin.name : '—'}</TableCell>
                    <TableCell>
                      <Chip
                        label={customer.isActive ? 'Active' : 'Inactive'}
                        color={customer.isActive ? 'success' : 'default'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Tooltip title="Edit">
                        <IconButton size="small" onClick={() => openEditDialog(customer)}>
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => setDeleteTarget(customer)}
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
        <DialogTitle>{editingId ? 'Edit Customer' : 'Add Customer'}</DialogTitle>
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
          <FormControl fullWidth margin="dense" required>
            <InputLabel id="customer-tenant-label">Tenant</InputLabel>
            <Select
              labelId="customer-tenant-label"
              label="Tenant"
              value={form.tenantId}
              onChange={(event) => setForm((prev) => ({ ...prev, tenantId: event.target.value }))}
            >
              {tenants.map((tenant) => (
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
        title="Delete Customer"
        message={deleteTarget ? `Delete "${deleteTarget.name}"?` : ''}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
      />
    </AdminPage>
  );
};

export default CustomersPage;
