import { Box, Container, Paper, Typography } from '@mui/material';
import ThemeToggle from '../common/ThemeToggle.jsx';

const AuthLayout = ({ title, subtitle, children }) => (
  <Box
    sx={{
      minHeight: '100vh',
      display: 'flex',
      bgcolor: 'background.default',
      position: 'relative',
    }}
  >
    <Box
      sx={{
        display: { xs: 'none', md: 'flex' },
        flex: 1,
        flexDirection: 'column',
        justifyContent: 'center',
        px: 8,
        background: (theme) =>
          theme.palette.mode === 'dark'
            ? `linear-gradient(135deg, #1E1B4B 0%, #312E81 50%, ${theme.palette.secondary.dark} 100%)`
            : `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
        color: 'primary.contrastText',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          top: -80,
          right: -80,
          width: 320,
          height: 320,
          borderRadius: '50%',
          bgcolor: 'rgba(255, 255, 255, 0.08)',
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          bottom: -120,
          left: -60,
          width: 400,
          height: 400,
          borderRadius: '50%',
          bgcolor: 'rgba(255, 255, 255, 0.05)',
        }}
      />
      <Box sx={{ position: 'relative', maxWidth: 420 }}>
        <Typography variant="h3" sx={{ fontWeight: 700, mb: 2 }}>
          NexDesk
        </Typography>
        <Typography variant="h5" sx={{ fontWeight: 500, opacity: 0.9, mb: 2 }}>
          Your all-in-one business operations platform
        </Typography>
        <Typography variant="body1" sx={{ opacity: 0.75, lineHeight: 1.7 }}>
          Manage orders, customers, and teams from a single dashboard — built for
          modern SaaS workflows.
        </Typography>
      </Box>
    </Box>

    <Box
      sx={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        py: 4,
        px: 2,
        position: 'relative',
      }}
    >
      <Box sx={{ position: 'absolute', top: 16, right: 16 }}>
        <ThemeToggle />
      </Box>

      <Container maxWidth="sm">
        <Paper
          sx={{
            p: { xs: 3, sm: 4 },
            border: 1,
            borderColor: 'divider',
            boxShadow: (theme) => (theme.palette.mode === 'dark' ? 4 : 2),
          }}
        >
          <Typography component="h1" variant="h4" gutterBottom>
            {title}
          </Typography>
          {subtitle && (
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              {subtitle}
            </Typography>
          )}
          {children}
        </Paper>
      </Container>
    </Box>
  </Box>
);

export default AuthLayout;
