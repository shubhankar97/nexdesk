import { Box, Button, Typography } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';
import { ROLES, getLoginPath } from '../constants/roles.js';

const UnauthorizedPage = () => {
  const { isAuthenticated, user } = useAuth();
  const homePath = isAuthenticated
    ? user?.role === ROLES.MASTER
      ? '/master'
      : user?.role === ROLES.CUSTOMER
        ? '/portal'
        : '/'
    : getLoginPath(user?.role);

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 2,
        px: 3,
        textAlign: 'center',
      }}
    >
      <Typography variant="h4" component="h1">
        Unauthorized
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 420 }}>
        You do not have access to this page. Contact your administrator if you need Document AI
        or another module enabled.
      </Typography>
      <Button component={RouterLink} to={homePath} variant="contained">
        Go back
      </Button>
    </Box>
  );
};

export default UnauthorizedPage;
