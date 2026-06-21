import { useMemo, useState } from 'react';
import { Link as RouterLink, useNavigate, useSearchParams } from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  Link,
  TextField,
} from '@mui/material';
import AuthLayout from '../../components/auth/AuthLayout.jsx';
import * as authService from '../../services/auth.service.js';

const ResetPasswordPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const tokenFromUrl = useMemo(() => searchParams.get('token') || '', [searchParams]);

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSuccess('');
    setFieldErrors({});
    setLoading(true);

    try {
      const result = await authService.resetPassword({
        token: tokenFromUrl,
        password,
        confirmPassword,
      });
      setSuccess(result.message);
      setPassword('');
      setConfirmPassword('');
      setTimeout(() => navigate('/login', { replace: true }), 2000);
    } catch (err) {
      const apiErrors = err.response?.data?.errors;

      if (apiErrors?.length) {
        const mapped = apiErrors.reduce((acc, item) => {
          acc[item.field] = item.message;
          return acc;
        }, {});
        setFieldErrors(mapped);
      }

      setError(err.response?.data?.message || 'Unable to reset password.');
    } finally {
      setLoading(false);
    }
  };

  if (!tokenFromUrl) {
    return (
      <AuthLayout title="Reset password" subtitle="Invalid or missing reset link">
        <Alert severity="error" sx={{ mb: 2 }}>
          This reset link is invalid. Request a new link from the forgot password page.
        </Alert>
        <Box sx={{ textAlign: 'center' }}>
          <Link component={RouterLink} to="/forgot-password" variant="body2">
            Request reset link
          </Link>
        </Box>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title="Reset password" subtitle="Choose a new password for your account">
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {success}
        </Alert>
      )}

      <Box component="form" onSubmit={handleSubmit} noValidate>
        <TextField
          margin="normal"
          required
          fullWidth
          name="password"
          label="New password"
          type="password"
          id="password"
          autoComplete="new-password"
          autoFocus
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          error={Boolean(fieldErrors.password)}
          helperText={fieldErrors.password || 'Minimum 8 characters'}
        />
        <TextField
          margin="normal"
          required
          fullWidth
          name="confirmPassword"
          label="Confirm password"
          type="password"
          id="confirmPassword"
          autoComplete="new-password"
          value={confirmPassword}
          onChange={(event) => setConfirmPassword(event.target.value)}
          error={Boolean(fieldErrors.confirmPassword)}
          helperText={fieldErrors.confirmPassword}
        />

        <Button
          type="submit"
          fullWidth
          variant="contained"
          sx={{ mt: 3, mb: 2 }}
          disabled={loading || Boolean(success)}
        >
          {loading ? 'Resetting...' : 'Reset password'}
        </Button>

        <Box sx={{ textAlign: 'center' }}>
          <Link component={RouterLink} to="/login" variant="body2">
            Back to login
          </Link>
        </Box>
      </Box>
    </AuthLayout>
  );
};

export default ResetPasswordPage;
