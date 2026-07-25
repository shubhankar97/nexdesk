import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
  Stack,
  Typography,
} from '@mui/material';
import AdminPage from '../../components/layout/AdminPage.jsx';
import { hasModuleAccess, MODULES } from '../../constants/modules.js';
import { useAuth } from '../../hooks/useAuth.js';
import * as authService from '../../services/auth.service.js';
import * as subscriptionService from '../../services/subscription.service.js';
import * as tenantService from '../../services/tenant.service.js';
import { getTenantHost } from '../../utils/subdomain.js';

const formatDate = (value) => {
  if (!value) return '—';
  return new Date(value).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

const formatPrice = (price, currency = 'INR') => {
  if (price == null) return '—';
  try {
    return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency,
      maximumFractionDigits: 0,
    }).format(Number(price) / 100);
  } catch {
    return `${(Number(price) / 100).toFixed(0)} ${currency}`;
  }
};

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

const SettingsPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [tenant, setTenant] = useState(null);
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [resetMessage, setResetMessage] = useState('');
  const [resetError, setResetError] = useState('');
  const [resetting, setResetting] = useState(false);

  const loadSettings = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const [tenantData, subscriptionData] = await Promise.all([
        tenantService.getCurrentTenant(),
        subscriptionService.getCurrentSubscription(),
      ]);
      setTenant(tenantData);
      setSubscription(subscriptionData);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load settings.');
      setTenant(null);
      setSubscription(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  const handlePasswordReset = async () => {
    if (!user?.email) {
      setResetError('No signed-in email available.');
      return;
    }

    setResetting(true);
    setResetMessage('');
    setResetError('');

    try {
      const result = await authService.forgotPassword(user.email);
      setResetMessage(
        result?.message || 'If an account exists for this email, a reset link has been sent.'
      );
    } catch (err) {
      setResetError(err.response?.data?.message || 'Failed to request password reset.');
    } finally {
      setResetting(false);
    }
  };

  const documentAiEnabled = hasModuleAccess(tenant, MODULES.DOCUMENT_AI);
  const plan = subscription?.plan || tenant?.plan || null;

  return (
    <AdminPage title="Settings" description="Organization, subscription, and account preferences.">
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Card variant="outlined" sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
                  Organization
                </Typography>
                <Stack spacing={1.75}>
                  <Box>
                    <Typography variant="caption" color="text.secondary" display="block">
                      Company
                    </Typography>
                    <Typography variant="body1">{tenant?.companyName || '—'}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary" display="block">
                      Subdomain
                    </Typography>
                    <Typography variant="body1">
                      {tenant?.subdomain ? getTenantHost(tenant.subdomain) : '—'}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                      Tenant status
                    </Typography>
                    <Chip
                      label={tenant?.isActive ? 'Active' : 'Inactive'}
                      color={tenant?.isActive ? 'success' : 'default'}
                      size="small"
                    />
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                      Document AI
                    </Typography>
                    <Chip
                      label={documentAiEnabled ? 'Enabled' : 'Not entitled'}
                      color={documentAiEnabled ? 'primary' : 'default'}
                      size="small"
                      variant={documentAiEnabled ? 'filled' : 'outlined'}
                    />
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Card variant="outlined" sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
                  Subscription
                </Typography>
                <Stack spacing={1.75}>
                  <Box>
                    <Typography variant="caption" color="text.secondary" display="block">
                      Plan
                    </Typography>
                    <Typography variant="body1">{plan?.name || 'No plan assigned'}</Typography>
                    {plan && (
                      <Typography variant="body2" color="text.secondary">
                        {formatPrice(plan.price, plan.currency)} / {plan.interval || 'month'}
                      </Typography>
                    )}
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                      Status
                    </Typography>
                    <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                      <Chip
                        label={subscription?.subscriptionStatus || tenant?.subscriptionStatus || '—'}
                        color={subscriptionChipColor(
                          subscription?.subscriptionStatus || tenant?.subscriptionStatus
                        )}
                        size="small"
                        variant="outlined"
                        sx={{ textTransform: 'capitalize' }}
                      />
                      {subscription?.isExpired && (
                        <Chip label="Expired" color="error" size="small" />
                      )}
                    </Stack>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary" display="block">
                      Current period
                    </Typography>
                    <Typography variant="body2">
                      {formatDate(subscription?.currentPeriodStart || tenant?.currentPeriodStart)} –{' '}
                      {formatDate(subscription?.currentPeriodEnd || tenant?.currentPeriodEnd)}
                    </Typography>
                  </Box>
                  {plan?.features?.length > 0 && (
                    <Box>
                      <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                        Features
                      </Typography>
                      <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap>
                        {plan.features.map((feature) => (
                          <Chip key={feature} label={feature} size="small" variant="outlined" />
                        ))}
                      </Stack>
                    </Box>
                  )}
                  {!subscription?.payuConfigured && (
                    <Typography variant="caption" color="text.secondary">
                      Billing checkout is unavailable until PayU is configured.
                    </Typography>
                  )}
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12 }}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
                  Account
                </Typography>
                <Stack
                  direction={{ xs: 'column', sm: 'row' }}
                  justifyContent="space-between"
                  alignItems={{ xs: 'flex-start', sm: 'center' }}
                  spacing={2}
                >
                  <Box>
                    <Typography variant="body1" fontWeight={600}>
                      {user?.email || '—'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Admin account · member since {formatDate(user?.createdAt)}
                    </Typography>
                  </Box>
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
                    <Button variant="outlined" onClick={() => navigate('/profile')}>
                      View profile
                    </Button>
                    <Button
                      variant="contained"
                      onClick={handlePasswordReset}
                      disabled={resetting || !user?.email}
                    >
                      {resetting ? 'Sending…' : 'Send password reset'}
                    </Button>
                  </Stack>
                </Stack>

                {(resetMessage || resetError) && <Divider sx={{ my: 2 }} />}
                {resetMessage && <Alert severity="success">{resetMessage}</Alert>}
                {resetError && (
                  <Alert severity="error" onClose={() => setResetError('')}>
                    {resetError}
                  </Alert>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}
    </AdminPage>
  );
};

export default SettingsPage;
