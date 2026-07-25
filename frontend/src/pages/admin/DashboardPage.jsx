import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AddIcon from '@mui/icons-material/Add';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import EventBusyIcon from '@mui/icons-material/EventBusy';
import PeopleOutlineIcon from '@mui/icons-material/PeopleOutline';
import ScheduleIcon from '@mui/icons-material/Schedule';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Divider,
  Grid,
  LinearProgress,
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
import DocumentAiUsageCard from '../../components/features/documentAi/DocumentAiUsageCard.jsx';
import OrderStatusChip from '../../components/features/orders/OrderStatusChip.jsx';
import { hasModuleAccess, MODULES } from '../../constants/modules.js';
import { ORDER_STATUS, ORDER_STATUS_OPTIONS } from '../../constants/order.js';
import * as documentService from '../../services/document.service.js';
import * as orderService from '../../services/order.service.js';
import * as tenantService from '../../services/tenant.service.js';
import { formatOrderDate } from '../../utils/order.js';

const StatCard = ({ label, value, hint, icon: Icon, color = 'primary.main' }) => (
  <Card variant="outlined" sx={{ height: '100%' }}>
    <CardContent sx={{ py: 2.5, '&:last-child': { pb: 2.5 } }}>
      <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={1}>
        <Box>
          <Typography variant="overline" color="text.secondary" display="block">
            {label}
          </Typography>
          <Typography variant="h4" fontWeight={700} sx={{ mt: 0.5 }}>
            {value}
          </Typography>
          {hint && (
            <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.75 }}>
              {hint}
            </Typography>
          )}
        </Box>
        <Box
          sx={{
            width: 40,
            height: 40,
            borderRadius: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: 'action.hover',
            color,
            flexShrink: 0,
          }}
        >
          <Icon fontSize="small" />
        </Box>
      </Stack>
    </CardContent>
  </Card>
);

const DashboardPage = () => {
  const navigate = useNavigate();
  const [tenant, setTenant] = useState(null);
  const [orders, setOrders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [usage, setUsage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [usageLoading, setUsageLoading] = useState(false);
  const [error, setError] = useState('');

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const currentTenant = await tenantService.getCurrentTenant();
      setTenant(currentTenant);

      const ordersEnabled = hasModuleAccess(currentTenant, MODULES.ORDERS);

      if (ordersEnabled) {
        const [orderData, customerData] = await Promise.all([
          orderService.listOrders(),
          orderService.listOrderCustomers(),
        ]);
        setOrders(Array.isArray(orderData) ? orderData : []);
        setCustomers(Array.isArray(customerData) ? customerData : []);
      } else {
        setOrders([]);
        setCustomers([]);
      }

      if (!hasModuleAccess(currentTenant, MODULES.DOCUMENT_AI)) {
        setUsage(null);
        return;
      }

      setUsageLoading(true);
      try {
        const usageData = await documentService.getDocumentAiUsage();
        setUsage(usageData);
      } catch {
        setUsage(null);
      } finally {
        setUsageLoading(false);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load dashboard.');
      setTenant(null);
      setOrders([]);
      setCustomers([]);
      setUsage(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const showDocumentAi = hasModuleAccess(tenant, MODULES.DOCUMENT_AI);
  const showOrders = hasModuleAccess(tenant, MODULES.ORDERS);

  const metrics = useMemo(() => {
    const statusCounts = ORDER_STATUS_OPTIONS.reduce((acc, status) => {
      acc[status] = 0;
      return acc;
    }, {});

    orders.forEach((order) => {
      if (statusCounts[order.status] !== undefined) {
        statusCounts[order.status] += 1;
      }
    });

    const active = statusCounts[ORDER_STATUS.ACTIVE] || 0;
    const dueForRenewal = statusCounts[ORDER_STATUS.DUE_FOR_RENEWAL] || 0;
    const expired = statusCounts[ORDER_STATUS.EXPIRED] || 0;

    const recentOrders = [...orders]
      .sort((a, b) => {
        const aTime = new Date(a.updatedAt || a.createdAt || a.nextRenewal || 0).getTime();
        const bTime = new Date(b.updatedAt || b.createdAt || b.nextRenewal || 0).getTime();
        return bTime - aTime;
      })
      .slice(0, 6);

    const upcomingRenewals = [...orders]
      .filter((order) => order.status === ORDER_STATUS.DUE_FOR_RENEWAL)
      .sort((a, b) => new Date(a.nextRenewal || 0) - new Date(b.nextRenewal || 0))
      .slice(0, 5);

    return {
      totalOrders: orders.length,
      activeCustomers: customers.length,
      active,
      dueForRenewal,
      expired,
      statusCounts,
      recentOrders,
      upcomingRenewals,
    };
  }, [orders, customers]);

  return (
    <AdminPage title="Dashboard" description="Overview of your business activity.">
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={1.5}
        justifyContent="flex-end"
        sx={{ mb: 2.5 }}
      >
        {showOrders && (
          <Button
            variant="outlined"
            startIcon={<ShoppingCartIcon />}
            onClick={() => navigate('/orders')}
          >
            Manage Orders
          </Button>
        )}
        {showDocumentAi && (
          <Button
            variant="outlined"
            startIcon={<AutoAwesomeIcon />}
            onClick={() => navigate('/document-ai')}
          >
            Document AI
          </Button>
        )}
        {showOrders && (
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => navigate('/orders')}>
            Add Order
          </Button>
        )}
      </Stack>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <StatCard
                label="Total Orders"
                value={metrics.totalOrders}
                hint={`${metrics.active} active certificates`}
                icon={ShoppingCartIcon}
                color="primary.main"
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <StatCard
                label="Active Customers"
                value={metrics.activeCustomers}
                hint="Customers with active accounts"
                icon={PeopleOutlineIcon}
                color="info.main"
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <StatCard
                label="Due for Renewal"
                value={metrics.dueForRenewal}
                hint="Within the next 30 days"
                icon={ScheduleIcon}
                color="warning.main"
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <StatCard
                label="Expired"
                value={metrics.expired}
                hint="Certificates past validity"
                icon={EventBusyIcon}
                color="error.main"
              />
            </Grid>
          </Grid>

          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid size={{ xs: 12, md: 5 }}>
              <Card variant="outlined" sx={{ height: '100%' }}>
                <CardContent>
                  <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
                    <TrendingUpIcon fontSize="small" color="action" />
                    <Typography variant="subtitle1" fontWeight={600}>
                      Order status
                    </Typography>
                  </Stack>

                  {metrics.totalOrders === 0 ? (
                    <Typography variant="body2" color="text.secondary">
                      No orders yet. Create your first order to see status breakdown.
                    </Typography>
                  ) : (
                    <Stack spacing={1.5}>
                      {ORDER_STATUS_OPTIONS.map((status) => {
                        const count = metrics.statusCounts[status] || 0;
                        return (
                          <Box key={status}>
                            <Stack
                              direction="row"
                              justifyContent="space-between"
                              alignItems="center"
                              sx={{ mb: 0.75 }}
                            >
                              <OrderStatusChip status={status} />
                              <Typography variant="body2" fontWeight={600}>
                                {count}
                              </Typography>
                            </Stack>
                            <LinearProgress
                              variant="determinate"
                              value={metrics.totalOrders ? (count / metrics.totalOrders) * 100 : 0}
                              color={
                                status === ORDER_STATUS.EXPIRED
                                  ? 'error'
                                  : status === ORDER_STATUS.DUE_FOR_RENEWAL
                                    ? 'warning'
                                    : 'success'
                              }
                              sx={{ height: 6, borderRadius: 1 }}
                            />
                          </Box>
                        );
                      })}
                    </Stack>
                  )}
                </CardContent>
              </Card>
            </Grid>

            <Grid size={{ xs: 12, md: 7 }}>
              <Card variant="outlined" sx={{ height: '100%' }}>
                <CardContent>
                  <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
                    <WarningAmberIcon fontSize="small" color="action" />
                    <Typography variant="subtitle1" fontWeight={600}>
                      Upcoming renewals
                    </Typography>
                  </Stack>

                  {metrics.upcomingRenewals.length === 0 ? (
                    <Typography variant="body2" color="text.secondary">
                      No certificates are due for renewal right now.
                    </Typography>
                  ) : (
                    <Stack spacing={1.5} divider={<Divider flexItem />}>
                      {metrics.upcomingRenewals.map((order) => (
                        <Stack
                          key={order.id || order._id}
                          direction={{ xs: 'column', sm: 'row' }}
                          justifyContent="space-between"
                          alignItems={{ xs: 'flex-start', sm: 'center' }}
                          spacing={0.75}
                        >
                          <Box>
                            <Typography variant="body2" fontWeight={600}>
                              {order.certificateName}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {order.customer?.email || '—'}
                            </Typography>
                          </Box>
                          <Stack direction="row" spacing={1} alignItems="center">
                            <Typography variant="caption" color="text.secondary">
                              {formatOrderDate(order.nextRenewal)}
                            </Typography>
                            <OrderStatusChip status={order.status} />
                          </Stack>
                        </Stack>
                      ))}
                    </Stack>
                  )}

                  {metrics.dueForRenewal > 0 && (
                    <Button size="small" sx={{ mt: 2 }} onClick={() => navigate('/orders')}>
                      Review renewals
                    </Button>
                  )}
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {showDocumentAi && (
            <Box sx={{ mt: 2 }}>
              <DocumentAiUsageCard usage={usage} loading={usageLoading} />
            </Box>
          )}

          <Card variant="outlined" sx={{ mt: 2 }}>
            <CardContent sx={{ pb: 1 }}>
              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                justifyContent="space-between"
                alignItems={{ xs: 'flex-start', sm: 'center' }}
                spacing={1}
                sx={{ mb: 1.5 }}
              >
                <Typography variant="subtitle1" fontWeight={600}>
                  Recent orders
                </Typography>
                <Button size="small" onClick={() => navigate('/orders')}>
                  View all
                </Button>
              </Stack>

              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Certificate</TableCell>
                      <TableCell>Customer</TableCell>
                      <TableCell>Next renewal</TableCell>
                      <TableCell>Validity</TableCell>
                      <TableCell>Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {metrics.recentOrders.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5}>
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            align="center"
                            sx={{ py: 3 }}
                          >
                            No orders yet. Add your first order to get started.
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ) : (
                      metrics.recentOrders.map((order) => (
                        <TableRow key={order.id || order._id} hover>
                          <TableCell>
                            <Typography variant="body2" fontWeight={600}>
                              {order.certificateName}
                            </Typography>
                          </TableCell>
                          <TableCell>{order.customer?.email || '—'}</TableCell>
                          <TableCell>{formatOrderDate(order.nextRenewal)}</TableCell>
                          <TableCell>{formatOrderDate(order.validity)}</TableCell>
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
        </>
      )}
    </AdminPage>
  );
};

export default DashboardPage;
