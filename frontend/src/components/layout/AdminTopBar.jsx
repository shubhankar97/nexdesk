import MenuIcon from '@mui/icons-material/Menu';
import {
  AppBar,
  Avatar,
  Box,
  IconButton,
  Toolbar,
  Typography,
} from '@mui/material';
import { useAuth } from '../../context/AuthContext.jsx';
import { ROLE_LABELS } from '../../constants/roles.js';
import ThemeToggle from '../common/ThemeToggle.jsx';
import { DRAWER_WIDTH } from './AdminSidebar.jsx';

const AdminTopBar = ({ onMenuClick }) => {
  const { user } = useAuth();

  const displayName = user?.name || user?.email || 'Admin';
  const initials = displayName.charAt(0).toUpperCase();
  const roleLabel = ROLE_LABELS[user?.role] || user?.role || 'Admin';

  return (
    <AppBar
      position="fixed"
      elevation={0}
      sx={{
        width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
        ml: { md: `${DRAWER_WIDTH}px` },
        bgcolor: 'background.paper',
        color: 'text.primary',
        borderBottom: 1,
        borderColor: 'divider',
      }}
    >
      <Toolbar>
        <IconButton
          color="inherit"
          edge="start"
          onClick={onMenuClick}
          sx={{ mr: 2, display: { md: 'none' } }}
          aria-label="open navigation menu"
        >
          <MenuIcon />
        </IconButton>
        <Box sx={{ flexGrow: 1 }} />
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <ThemeToggle />
          <Box sx={{ textAlign: 'right', display: { xs: 'none', sm: 'block' } }}>
            <Typography variant="body2" fontWeight={600}>
              {displayName}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {roleLabel}
            </Typography>
          </Box>
          <Avatar sx={{ width: 36, height: 36, bgcolor: 'primary.main', fontSize: '0.95rem' }}>
            {initials}
          </Avatar>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default AdminTopBar;
