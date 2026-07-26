import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
} from '@mui/material';

const OrderFormDialog = ({
  open,
  title,
  form,
  customers,
  customersLoading,
  saving,
  error,
  onClose,
  onChange,
  onSubmit,
}) => (
  <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
    <DialogTitle>{title}</DialogTitle>
    <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
      <TextField
        label="Certificate Name"
        value={form.certificateName}
        onChange={(event) => onChange('certificateName', event.target.value)}
        required
        fullWidth
        autoFocus
      />
      <TextField
        label="Issue Date"
        type="date"
        value={form.issueDate}
        onChange={(event) => onChange('issueDate', event.target.value)}
        required
        fullWidth
        InputLabelProps={{ shrink: true }}
      />
      <TextField
        label="Validity"
        type="date"
        value={form.validity}
        onChange={(event) => onChange('validity', event.target.value)}
        required
        fullWidth
        InputLabelProps={{ shrink: true }}
      />
      <TextField
        label="Next Renewal"
        type="date"
        value={form.nextRenewal}
        onChange={(event) => onChange('nextRenewal', event.target.value)}
        required
        fullWidth
        InputLabelProps={{ shrink: true }}
      />
      <FormControl fullWidth required>
        <InputLabel id="order-customer-label">Customer</InputLabel>
        <Select
          labelId="order-customer-label"
          label="Customer"
          value={form.customer}
          onChange={(event) => onChange('customer', event.target.value)}
          disabled={customersLoading || customers.length === 0}
          displayEmpty
        >
          {customersLoading && (
            <MenuItem disabled value="">
              Loading customers...
            </MenuItem>
          )}
          {!customersLoading && customers.length === 0 && (
            <MenuItem disabled value="">
              No customers found — run seed:users
            </MenuItem>
          )}
          {customers.map((customer) => (
            <MenuItem key={customer.id} value={String(customer.id)}>
              {customer.name ? `${customer.name} (${customer.email})` : customer.email}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      {error && (
        <span style={{ color: '#d32f2f', fontSize: '0.875rem' }}>{error}</span>
      )}
    </DialogContent>
    <DialogActions>
      <Button onClick={onClose}>Cancel</Button>
      <Button onClick={onSubmit} variant="contained" disabled={saving}>
        {saving ? 'Saving...' : 'Save'}
      </Button>
    </DialogActions>
  </Dialog>
);

export default OrderFormDialog;
