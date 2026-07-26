import { useCallback, useEffect, useState } from 'react';
import DeleteIcon from '@mui/icons-material/Delete';
import LockOpenIcon from '@mui/icons-material/LockOpen';
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
  IconButton,
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
import * as customerService from '../../services/customer.service.js';

const CustomersPage = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [activateTarget, setActivateTarget] = useState(null);
  const [password, setPassword] = useState('');
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);

  const loadCustomers = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const data = await customerService.listAllCustomers();
      setCustomers(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load customers.');
      setCustomers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCustomers();
  }, [loadCustomers]);

  const openActivateDialog = (customer) => {
    setActivateTarget(customer);
    setPassword('');
    setFormError('');
  };

  const handleActivate = async () => {
    if (!activateTarget) {
      return;
    }

    if (!password.trim() || password.trim().length < 8) {
      setFormError('Password must be at least 8 characters.');
      return;
    }

    setSaving(true);
    setFormError('');

    try {
      await customerService.updateCustomerForMaster(activateTarget.tenantId, activateTarget.id, {
        password: password.trim(),
        isActive: true,
      });
      setActivateTarget(null);
      setPassword('');
      await loadCustomers();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to activate customer.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeactivate = async (customer) => {
    try {
      await customerService.updateCustomerForMaster(customer.tenantId, customer.id, {
        isActive: false,
      });
      await loadCustomers();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to deactivate customer.');
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) {
      return;
    }

    try {
      await customerService.deleteCustomerForMaster(deleteTarget.tenantId, deleteTarget.id);
      setDeleteTarget(null);
      await loadCustomers();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete customer.');
      setDeleteTarget(null);
    }
  };

  return (
    <AdminPage
      title="Customers"
      description="View customers created by admins. Activate inactive users by setting a password."
    >
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
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
                <TableCell>Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Mobile</TableCell>
                <TableCell>Tenant</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {customers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6}>
                    <Typography variant="body2" color="text.secondary" align="center" sx={{ py: 3 }}>
                      No customers yet. Admins create inactive customer profiles from their dashboard.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                customers.map((customer) => (
                  <TableRow key={`${customer.tenantId}-${customer.id}`} hover>
                    <TableCell>{customer.name || '—'}</TableCell>
                    <TableCell>{customer.email}</TableCell>
                    <TableCell>{customer.mobile || '—'}</TableCell>
                    <TableCell>{customer.tenantName || customer.tenantId || '—'}</TableCell>
                    <TableCell>
                      <Chip
                        label={customer.isActive ? 'Active' : 'Inactive'}
                        color={customer.isActive ? 'success' : 'default'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="right">
                      {customer.isActive ? (
                        <Tooltip title="Deactivate">
                          <Button size="small" onClick={() => handleDeactivate(customer)}>
                            Deactivate
                          </Button>
                        </Tooltip>
                      ) : (
                        <Tooltip title="Activate">
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={() => openActivateDialog(customer)}
                          >
                            <LockOpenIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
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
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Dialog
        open={Boolean(activateTarget)}
        onClose={() => !saving && setActivateTarget(null)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Activate Customer</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1, mt: 0.5 }}>
            Set a password to activate{' '}
            <strong>{activateTarget?.name || activateTarget?.email}</strong>.
          </Typography>
          <TextField
            autoFocus
            margin="dense"
            label="New Password"
            type="password"
            fullWidth
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            helperText="Minimum 8 characters"
          />
          {formError && (
            <Typography variant="body2" color="error" sx={{ mt: 1 }}>
              {formError}
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setActivateTarget(null)} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={handleActivate} variant="contained" disabled={saving}>
            {saving ? 'Activating...' : 'Activate'}
          </Button>
        </DialogActions>
      </Dialog>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete Customer"
        message={
          deleteTarget
            ? `Delete "${deleteTarget.name || deleteTarget.email}"? Customers with linked orders cannot be deleted.`
            : ''
        }
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
      />
    </AdminPage>
  );
};

export default CustomersPage;
