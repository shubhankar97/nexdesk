import { useMemo, useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  Link,
  Tab,
  Tabs,
  TextField,
} from '@mui/material';
import AuthLayout from '../../components/auth/AuthLayout.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { ROLES, ROLE_LABELS } from '../../constants/roles.js';
import * as authService from '../../services/auth.service.js';
import { isTenantSubdomain } from '../../utils/subdomain.js';

const ALL_LOGIN_ROLES = [ROLES.MASTER, ROLES.ADMIN, ROLES.CUSTOMER];

const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const loginRoles = useMemo(
    () => (isTenantSubdomain() ? ALL_LOGIN_ROLES.filter((r) => r !== ROLES.MASTER) : ALL_LOGIN_ROLES),
    []
  );
  const [role, setRole] = useState(ROLES.CUSTOMER);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleRoleChange = (_event, newRole) => {
    if (!loginRoles.includes(newRole)) {
      return;
    }

    setRole(newRole);
    setError('');
    setFieldErrors({});
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setFieldErrors({});
    setLoading(true);

    try {
      if (role === ROLES.MASTER && isTenantSubdomain()) {
        setError('Master login is not available on tenant subdomains.');
        return;
      }

      const result = await authService.login(role, { email, password });
      login(result.accessToken, result.refreshToken, result.user);
      const homePath =
        role === ROLES.CUSTOMER ? '/portal' : role === ROLES.MASTER ? '/master' : '/';
      navigate(homePath, { replace: true });
    } catch (err) {
      const apiErrors = err.response?.data?.errors;

      if (apiErrors?.length) {
        const mapped = apiErrors.reduce((acc, item) => {
          acc[item.field] = item.message;
          return acc;
        }, {});
        setFieldErrors(mapped);
      }

      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const showForgotPassword = role === ROLES.ADMIN || role === ROLES.CUSTOMER;

  return (
    <AuthLayout
      title="Sign in to NexDesk"
      subtitle={`${ROLE_LABELS[role]} login`}
    >
      <Tabs
        value={role}
        onChange={handleRoleChange}
        variant="fullWidth"
        sx={{ mb: 3 }}
      >
        {loginRoles.map((loginRole) => (
          <Tab key={loginRole} label={ROLE_LABELS[loginRole]} value={loginRole} />
        ))}
      </Tabs>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Box component="form" onSubmit={handleSubmit} noValidate>
        <TextField
          margin="normal"
          required
          fullWidth
          id="email"
          label="Email address"
          name="email"
          autoComplete="email"
          autoFocus
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          error={Boolean(fieldErrors.email)}
          helperText={fieldErrors.email}
        />
        <TextField
          margin="normal"
          required
          fullWidth
          name="password"
          label="Password"
          type="password"
          id="password"
          autoComplete="current-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          error={Boolean(fieldErrors.password)}
          helperText={fieldErrors.password}
        />

        {showForgotPassword && (
          <Box sx={{ textAlign: 'right', mt: 1 }}>
            <Link component={RouterLink} to="/forgot-password" variant="body2">
              Forgot password?
            </Link>
          </Box>
        )}

        <Button
          type="submit"
          fullWidth
          variant="contained"
          sx={{ mt: 3, mb: 2 }}
          disabled={loading}
        >
          {loading ? 'Signing in...' : 'Sign in'}
        </Button>
      </Box>
    </AuthLayout>
  );
};

export default LoginPage;
