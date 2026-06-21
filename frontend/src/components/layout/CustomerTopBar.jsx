import MenuIcon from '@mui/icons-material/Menu';
import {
  AppBar,
  Box,
  IconButton,
  Toolbar,
  Typography,
} from '@mui/material';
import { useAuth } from '../../context/AuthContext.jsx';
import { PROFILE_PATHS, ROLE_LABELS } from '../../constants/roles.js';
import ThemeToggle from '../common/ThemeToggle.jsx';
import UserMenu from './UserMenu.jsx';
import { DRAWER_WIDTH } from './CustomerSidebar.jsx';

const CustomerTopBar = ({ onMenuClick }) => {
  const { user } = useAuth();

  const displayName = user?.name || user?.email || 'Customer';
  const roleLabel = ROLE_LABELS[user?.role] || user?.role || 'Customer';
  const profilePath = PROFILE_PATHS[user?.role] || '/portal/profile';

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
          <UserMenu profilePath={profilePath} />
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default CustomerTopBar;
