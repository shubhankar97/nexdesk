import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AddIcon from '@mui/icons-material/Add';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import BusinessIcon from '@mui/icons-material/Business';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import PeopleOutlineIcon from '@mui/icons-material/PeopleOutline';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
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
import * as adminService from '../../services/admin.service.js';
import * as tenantService from '../../services/tenant.service.js';
import { getTenantHost } from '../../utils/subdomain.js';

const subscriptionChipColor = (status) => {
  switch ((status || '').toLowerCase()) {
    case 'active':
      return 'success';
    case 'trialing':
      return 'info';
    case 'past_due':
    case 'unpaid':
      return 'warning';
    case 'canceled':
    case 'cancelled':
    case 'expired':
      return 'error';
    default:
      return 'default';
  }
};

const formatDate = (value) => {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

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
  const [tenants, setTenants] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const [tenantData, adminData] = await Promise.all([
        tenantService.listTenants(),
        adminService.listAdmins(),
      ]);
      setTenants(Array.isArray(tenantData) ? tenantData : []);
      setAdmins(Array.isArray(adminData) ? adminData : []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load dashboard.');
      setTenants([]);
      setAdmins([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const metrics = useMemo(() => {
    const activeTenants = tenants.filter((tenant) => tenant.isActive);
    const inactiveTenants = tenants.length - activeTenants.length;
    const documentAiEnabled = tenants.filter((tenant) => tenant.addons?.documentAi).length;
    const activeAdmins = admins.filter((admin) => admin.isActive).length;

    const tenantIdsWithAdmin = new Set(admins.map((admin) => admin.tenantId).filter(Boolean));
    const tenantsWithoutAdmin = activeTenants.filter(
      (tenant) => !tenantIdsWithAdmin.has(tenant.tenantId)
    );

    const subscriptionCounts = tenants.reduce((acc, tenant) => {
      const status = tenant.subscriptionStatus || 'unknown';
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {});

    const attentionStatuses = ['past_due', 'unpaid', 'canceled', 'cancelled', 'expired'];
    const needsAttention = tenants.filter((tenant) =>
      attentionStatuses.includes((tenant.subscriptionStatus || '').toLowerCase())
    ).length;

    const recentTenants = [...tenants]
      .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
      .slice(0, 6);

    return {
      totalTenants: tenants.length,
      activeTenants: activeTenants.length,
      inactiveTenants,
      totalAdmins: admins.length,
      activeAdmins,
      documentAiEnabled,
      documentAiCoverage:
        tenants.length === 0 ? 0 : Math.round((documentAiEnabled / tenants.length) * 100),
      tenantsWithoutAdmin,
      subscriptionCounts,
      needsAttention,
      recentTenants,
    };
  }, [tenants, admins]);

  const subscriptionEntries = Object.entries(metrics.subscriptionCounts).sort(
    (a, b) => b[1] - a[1]
  );

  return (
    <AdminPage
      title="Dashboard"
      description="Platform overview across all tenants, subscriptions, and Document AI coverage."
    >
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
        <Button
          variant="outlined"
          startIcon={<BusinessIcon />}
          onClick={() => navigate('/master/tenants')}
        >
          Manage Tenants
        </Button>
        <Button
          variant="outlined"
          startIcon={<AdminPanelSettingsIcon />}
          onClick={() => navigate('/master/admins')}
        >
          Manage Admins
        </Button>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/master/tenants')}
        >
          Add Tenant
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
              <StatCard
                label="Tenants"
                value={metrics.totalTenants}
                hint={`${metrics.activeTenants} active · ${metrics.inactiveTenants} inactive`}
                icon={BusinessIcon}
                color="primary.main"
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <StatCard
                label="Admins"
                value={metrics.totalAdmins}
                hint={`${metrics.activeAdmins} active accounts`}
                icon={AdminPanelSettingsIcon}
                color="info.main"
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <StatCard
                label="Document AI"
                value={metrics.documentAiEnabled}
                hint={`${metrics.documentAiCoverage}% of tenants enabled`}
                icon={AutoAwesomeIcon}
                color="secondary.main"
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <StatCard
                label="Needs Attention"
                value={metrics.needsAttention}
                hint={
                  metrics.tenantsWithoutAdmin.length
                    ? `${metrics.tenantsWithoutAdmin.length} active without admin`
                    : 'Subscriptions & billing'
                }
                icon={WarningAmberIcon}
                color="warning.main"
              />
            </Grid>
          </Grid>

          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid size={{ xs: 12, md: 4 }}>
              <Card variant="outlined" sx={{ height: '100%' }}>
                <CardContent>
                  <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
                    <TrendingUpIcon fontSize="small" color="action" />
                    <Typography variant="subtitle1" fontWeight={600}>
                      Subscriptions
                    </Typography>
                  </Stack>

                  {subscriptionEntries.length === 0 ? (
                    <Typography variant="body2" color="text.secondary">
                      No subscription data yet.
                    </Typography>
                  ) : (
                    <Stack spacing={1.5}>
                      {subscriptionEntries.map(([status, count]) => (
                        <Box key={status}>
                          <Stack
                            direction="row"
                            justifyContent="space-between"
                            alignItems="center"
                            sx={{ mb: 0.75 }}
                          >
                            <Chip
                              label={status}
                              size="small"
                              color={subscriptionChipColor(status)}
                              variant="outlined"
                              sx={{ textTransform: 'capitalize' }}
                            />
                            <Typography variant="body2" fontWeight={600}>
                              {count}
                            </Typography>
                          </Stack>
                          <LinearProgress
                            variant="determinate"
                            value={metrics.totalTenants ? (count / metrics.totalTenants) * 100 : 0}
                            sx={{ height: 6, borderRadius: 1 }}
                          />
                        </Box>
                      ))}
                    </Stack>
                  )}
                </CardContent>
              </Card>
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <Card variant="outlined" sx={{ height: '100%' }}>
                <CardContent>
                  <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
                    <AutoAwesomeIcon fontSize="small" color="action" />
                    <Typography variant="subtitle1" fontWeight={600}>
                      Document AI coverage
                    </Typography>
                  </Stack>

                  <Typography variant="h3" fontWeight={700} sx={{ mb: 0.5 }}>
                    {metrics.documentAiCoverage}%
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {metrics.documentAiEnabled} of {metrics.totalTenants} tenants have the add-on
                    enabled.
                  </Typography>

                  <LinearProgress
                    variant="determinate"
                    value={metrics.documentAiCoverage}
                    sx={{ height: 8, borderRadius: 1, mb: 2 }}
                  />

                  <Divider sx={{ my: 2 }} />

                  <Button
                    size="small"
                    onClick={() => navigate('/master/document-ai')}
                    startIcon={<AutoAwesomeIcon />}
                  >
                    Open Document AI
                  </Button>
                </CardContent>
              </Card>
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <Card variant="outlined" sx={{ height: '100%' }}>
                <CardContent>
                  <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
                    <PeopleOutlineIcon fontSize="small" color="action" />
                    <Typography variant="subtitle1" fontWeight={600}>
                      Tenant health
                    </Typography>
                  </Stack>

                  <Stack spacing={1.75}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Stack direction="row" spacing={1} alignItems="center">
                        <CheckCircleOutlineIcon fontSize="small" color="success" />
                        <Typography variant="body2">Active tenants</Typography>
                      </Stack>
                      <Typography variant="body2" fontWeight={700}>
                        {metrics.activeTenants}
                      </Typography>
                    </Stack>

                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Stack direction="row" spacing={1} alignItems="center">
                        <WarningAmberIcon fontSize="small" color="warning" />
                        <Typography variant="body2">Missing admin</Typography>
                      </Stack>
                      <Typography variant="body2" fontWeight={700}>
                        {metrics.tenantsWithoutAdmin.length}
                      </Typography>
                    </Stack>

                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Stack direction="row" spacing={1} alignItems="center">
                        <BusinessIcon fontSize="small" color="disabled" />
                        <Typography variant="body2">Inactive tenants</Typography>
                      </Stack>
                      <Typography variant="body2" fontWeight={700}>
                        {metrics.inactiveTenants}
                      </Typography>
                    </Stack>
                  </Stack>

                  {metrics.tenantsWithoutAdmin.length > 0 && (
                    <>
                      <Divider sx={{ my: 2 }} />
                      <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1 }}>
                        Active tenants without an admin
                      </Typography>
                      <Stack spacing={0.75}>
                        {metrics.tenantsWithoutAdmin.slice(0, 4).map((tenant) => (
                          <Typography key={tenant.tenantId} variant="body2">
                            {tenant.companyName}
                          </Typography>
                        ))}
                      </Stack>
                      <Button
                        size="small"
                        sx={{ mt: 1.5 }}
                        onClick={() => navigate('/master/admins')}
                      >
                        Assign admins
                      </Button>
                    </>
                  )}
                </CardContent>
              </Card>
            </Grid>
          </Grid>

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
                  Recent tenants
                </Typography>
                <Button size="small" onClick={() => navigate('/master/tenants')}>
                  View all
                </Button>
              </Stack>

              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Company</TableCell>
                      <TableCell>Subdomain</TableCell>
                      <TableCell>Subscription</TableCell>
                      <TableCell>Document AI</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Created</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {metrics.recentTenants.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6}>
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            align="center"
                            sx={{ py: 3 }}
                          >
                            No tenants yet. Add your first tenant to get started.
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ) : (
                      metrics.recentTenants.map((tenant) => (
                        <TableRow key={tenant.tenantId} hover>
                          <TableCell>
                            <Typography variant="body2" fontWeight={600}>
                              {tenant.companyName}
                            </Typography>
                          </TableCell>
                          <TableCell>{getTenantHost(tenant.subdomain)}</TableCell>
                          <TableCell>
                            <Chip
                              label={tenant.subscriptionStatus || '—'}
                              size="small"
                              color={subscriptionChipColor(tenant.subscriptionStatus)}
                              variant="outlined"
                              sx={{ textTransform: 'capitalize' }}
                            />
                          </TableCell>
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
                          <TableCell>{formatDate(tenant.createdAt)}</TableCell>
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
