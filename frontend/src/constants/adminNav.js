import DashboardIcon from '@mui/icons-material/Dashboard';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import PeopleIcon from '@mui/icons-material/People';
import AssessmentIcon from '@mui/icons-material/Assessment';
import NotificationsIcon from '@mui/icons-material/Notifications';
import SettingsIcon from '@mui/icons-material/Settings';

export const ADMIN_NAV_ITEMS = [
  { label: 'Dashboard', path: '/', icon: DashboardIcon },
  { label: 'Orders', path: '/orders', icon: ShoppingCartIcon },
  { label: 'Customers', path: '/customers', icon: PeopleIcon },
  { label: 'Reports', path: '/reports', icon: AssessmentIcon },
  { label: 'Notifications', path: '/notifications', icon: NotificationsIcon },
  { label: 'Settings', path: '/settings', icon: SettingsIcon },
];
