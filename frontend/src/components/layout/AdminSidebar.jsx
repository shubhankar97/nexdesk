import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Box,
  Divider,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
} from '@mui/material';
import { ADMIN_NAV_ITEMS } from '../../constants/adminNav.js';
import { hasModuleAccess } from '../../constants/modules.js';
import * as tenantService from '../../services/tenant.service.js';

export const DRAWER_WIDTH = 260;

const AdminSidebar = ({ mobileOpen, onMobileClose }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [tenant, setTenant] = useState(null);

  useEffect(() => {
    let cancelled = false;

    const loadTenant = async () => {
      try {
        const data = await tenantService.getCurrentTenant();
        if (!cancelled) {
          setTenant(data);
        }
      } catch {
        if (!cancelled) {
          setTenant(null);
        }
      }
    };

    loadTenant();

    return () => {
      cancelled = true;
    };
  }, []);

  const navItems = useMemo(
    () =>
      ADMIN_NAV_ITEMS.filter(
        (item) => !item.module || hasModuleAccess(tenant, item.module)
      ),
    [tenant]
  );

  const handleNavigate = (path) => {
    navigate(path);
    onMobileClose();
  };

  const drawerContent = (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Toolbar sx={{ px: 2.5 }}>
        <Typography variant="h6" noWrap sx={{ fontWeight: 700, color: 'primary.main' }}>
          NexDesk
        </Typography>
      </Toolbar>
      <Divider />
      <List sx={{ flex: 1, px: 1, py: 2 }}>
        {navItems.map(({ label, path, icon: Icon }) => {
          const isActive =
            path === '/'
              ? location.pathname === '/'
              : location.pathname.startsWith(path);

          return (
            <ListItemButton
              key={path}
              selected={isActive}
              onClick={() => handleNavigate(path)}
            >
              <ListItemIcon>
                <Icon fontSize="small" />
              </ListItemIcon>
              <ListItemText primary={label} primaryTypographyProps={{ fontWeight: 500 }} />
            </ListItemButton>
          );
        })}
      </List>
      <Divider />
      <Box sx={{ p: 2 }}>
        <Typography variant="caption" color="text.secondary">
          Admin Panel
        </Typography>
      </Box>
    </Box>
  );

  return (
    <Box component="nav" sx={{ width: { md: DRAWER_WIDTH }, flexShrink: { md: 0 } }}>
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={onMobileClose}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: DRAWER_WIDTH,
          },
        }}
      >
        {drawerContent}
      </Drawer>
      <Drawer
        variant="permanent"
        open
        sx={{
          display: { xs: 'none', md: 'block' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: DRAWER_WIDTH,
            borderRight: 1,
            borderColor: 'divider',
          },
        }}
      >
        {drawerContent}
      </Drawer>
    </Box>
  );
};

export default AdminSidebar;
