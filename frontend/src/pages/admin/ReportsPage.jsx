import { useCallback, useEffect, useMemo, useState } from 'react';
import DownloadIcon from '@mui/icons-material/Download';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  FormControl,
  Grid,
  InputLabel,
  LinearProgress,
  MenuItem,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import AdminPage from '../../components/layout/AdminPage.jsx';
import OrderStatusChip from '../../components/features/orders/OrderStatusChip.jsx';
import { hasModuleAccess, MODULES } from '../../constants/modules.js';
import { ORDER_STATUS, ORDER_STATUS_OPTIONS } from '../../constants/order.js';
import * as orderService from '../../services/order.service.js';
import * as tenantService from '../../services/tenant.service.js';
import { formatOrderDate } from '../../utils/order.js';

const downloadCsv = (filename, rows) => {
  const escape = (value) => {
    const text = value == null ? '' : String(value);
    if (/[",\n]/.test(text)) {
      return `"${text.replace(/"/g, '""')}"`;
    }
    return text;
  };

  const csv = rows.map((row) => row.map(escape).join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
};

const ReportsPage = () => {
  const [orders, setOrders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [customerFilter, setCustomerFilter] = useState('all');

  const loadReports = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const tenant = await tenantService.getCurrentTenant();

      if (!hasModuleAccess(tenant, MODULES.ORDERS)) {
        setOrders([]);
        setCustomers([]);
        setError('Orders module is disabled for this tenant. Enable it in Master → Tenants to view reports.');
        return;
      }

      const [orderData, customerData] = await Promise.all([
        orderService.listOrders(),
        orderService.listOrderCustomers(),
      ]);
      setOrders(Array.isArray(orderData) ? orderData : []);
      setCustomers(Array.isArray(customerData) ? customerData : []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load reports.');
      setOrders([]);
      setCustomers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadReports();
  }, [loadReports]);

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      if (statusFilter !== 'all' && order.status !== statusFilter) {
        return false;
      }

      if (customerFilter !== 'all') {
        const customerId = order.customer?.id || order.customer;
        if (String(customerId) !== String(customerFilter)) {
          return false;
        }
      }

      return true;
    });
  }, [orders, statusFilter, customerFilter]);

  const metrics = useMemo(() => {
    const statusCounts = ORDER_STATUS_OPTIONS.reduce((acc, status) => {
      acc[status] = 0;
      return acc;
    }, {});

    filteredOrders.forEach((order) => {
      if (statusCounts[order.status] !== undefined) {
        statusCounts[order.status] += 1;
      }
    });

    const byCustomer = {};
    filteredOrders.forEach((order) => {
      const email = order.customer?.email || 'Unknown';
      if (!byCustomer[email]) {
        byCustomer[email] = { email, total: 0, active: 0, due: 0, expired: 0 };
      }
      byCustomer[email].total += 1;
      if (order.status === ORDER_STATUS.ACTIVE) byCustomer[email].active += 1;
      if (order.status === ORDER_STATUS.DUE_FOR_RENEWAL) byCustomer[email].due += 1;
      if (order.status === ORDER_STATUS.EXPIRED) byCustomer[email].expired += 1;
    });

    const upcomingRenewals = [...filteredOrders]
      .filter((order) => order.status === ORDER_STATUS.DUE_FOR_RENEWAL)
      .sort((a, b) => new Date(a.nextRenewal || 0) - new Date(b.nextRenewal || 0));

    return {
      total: filteredOrders.length,
      statusCounts,
      customerRows: Object.values(byCustomer).sort((a, b) => b.total - a.total),
      upcomingRenewals,
    };
  }, [filteredOrders]);

  const handleExport = () => {
    const rows = [
      ['Certificate', 'Customer', 'Status', 'Issue Date', 'Validity', 'Next Renewal'],
      ...filteredOrders.map((order) => [
        order.certificateName,
        order.customer?.email || '',
        order.status,
        formatOrderDate(order.issueDate),
        formatOrderDate(order.validity),
        formatOrderDate(order.nextRenewal),
      ]),
    ];
    downloadCsv(`nexdesk-orders-${new Date().toISOString().slice(0, 10)}.csv`, rows);
  };

  return (
    <AdminPage title="Reports" description="Analyze certificate performance and export order data.">
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={1.5}
        justifyContent="space-between"
        alignItems={{ xs: 'stretch', sm: 'center' }}
        sx={{ mb: 2.5 }}
      >
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ flex: 1 }}>
          <FormControl size="small" sx={{ minWidth: 180 }}>
            <InputLabel id="report-status-filter">Status</InputLabel>
            <Select
              labelId="report-status-filter"
              label="Status"
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
            >
              <MenuItem value="all">All statuses</MenuItem>
              {ORDER_STATUS_OPTIONS.map((status) => (
                <MenuItem key={status} value={status}>
                  {status}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 220 }}>
            <InputLabel id="report-customer-filter">Customer</InputLabel>
            <Select
              labelId="report-customer-filter"
              label="Customer"
              value={customerFilter}
              onChange={(event) => setCustomerFilter(event.target.value)}
            >
              <MenuItem value="all">All customers</MenuItem>
              {customers.map((customer) => (
                <MenuItem key={customer.id} value={customer.id}>
                  {customer.email}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Stack>

        <Button
          variant="outlined"
          startIcon={<DownloadIcon />}
          onClick={handleExport}
          disabled={loading || filteredOrders.length === 0}
        >
          Export CSV
        </Button>
      </Stack>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Card variant="outlined">
                <CardContent sx={{ py: 2.5, '&:last-child': { pb: 2.5 } }}>
                  <Typography variant="overline" color="text.secondary" display="block">
                    Orders in view
                  </Typography>
                  <Typography variant="h4" fontWeight={700}>
                    {metrics.total}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            {ORDER_STATUS_OPTIONS.map((status) => (
              <Grid key={status} size={{ xs: 12, sm: 6, md: 3 }}>
                <Card variant="outlined">
                  <CardContent sx={{ py: 2.5, '&:last-child': { pb: 2.5 } }}>
                    <Typography variant="overline" color="text.secondary" display="block">
                      {status}
                    </Typography>
                    <Typography variant="h4" fontWeight={700}>
                      {metrics.statusCounts[status] || 0}
                    </Typography>
                    <LinearProgress
                      variant="determinate"
                      value={metrics.total ? ((metrics.statusCounts[status] || 0) / metrics.total) * 100 : 0}
                      sx={{ mt: 1.5, height: 6, borderRadius: 1 }}
                      color={
                        status === ORDER_STATUS.EXPIRED
                          ? 'error'
                          : status === ORDER_STATUS.DUE_FOR_RENEWAL
                            ? 'warning'
                            : 'success'
                      }
                    />
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid size={{ xs: 12, md: 6 }}>
              <Card variant="outlined" sx={{ height: '100%' }}>
                <CardContent>
                  <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1.5 }}>
                    Orders by customer
                  </Typography>
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Customer</TableCell>
                          <TableCell align="right">Total</TableCell>
                          <TableCell align="right">Active</TableCell>
                          <TableCell align="right">Due</TableCell>
                          <TableCell align="right">Expired</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {metrics.customerRows.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={5}>
                              <Typography
                                variant="body2"
                                color="text.secondary"
                                align="center"
                                sx={{ py: 2 }}
                              >
                                No orders match the current filters.
                              </Typography>
                            </TableCell>
                          </TableRow>
                        ) : (
                          metrics.customerRows.map((row) => (
                            <TableRow key={row.email} hover>
                              <TableCell>{row.email}</TableCell>
                              <TableCell align="right">{row.total}</TableCell>
                              <TableCell align="right">{row.active}</TableCell>
                              <TableCell align="right">{row.due}</TableCell>
                              <TableCell align="right">{row.expired}</TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </CardContent>
              </Card>
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <Card variant="outlined" sx={{ height: '100%' }}>
                <CardContent>
                  <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1.5 }}>
                    Upcoming renewals
                  </Typography>
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Certificate</TableCell>
                          <TableCell>Customer</TableCell>
                          <TableCell>Next renewal</TableCell>
                          <TableCell>Status</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {metrics.upcomingRenewals.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={4}>
                              <Typography
                                variant="body2"
                                color="text.secondary"
                                align="center"
                                sx={{ py: 2 }}
                              >
                                No renewals due in the current view.
                              </Typography>
                            </TableCell>
                          </TableRow>
                        ) : (
                          metrics.upcomingRenewals.map((order) => (
                            <TableRow key={order.id} hover>
                              <TableCell>{order.certificateName}</TableCell>
                              <TableCell>{order.customer?.email || '—'}</TableCell>
                              <TableCell>{formatOrderDate(order.nextRenewal)}</TableCell>
                              <TableCell>
                                <OrderStatusChip status={order.status} />
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </>
      )}
    </AdminPage>
  );
};

export default ReportsPage;
