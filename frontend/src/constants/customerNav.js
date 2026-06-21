import DashboardIcon from '@mui/icons-material/Dashboard';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import DescriptionIcon from '@mui/icons-material/Description';
import NotificationsIcon from '@mui/icons-material/Notifications';
import PersonIcon from '@mui/icons-material/Person';

export const CUSTOMER_NAV_ITEMS = [
  { label: 'Dashboard', path: '/portal', icon: DashboardIcon },
  { label: 'Orders', path: '/portal/orders', icon: ShoppingCartIcon },
  { label: 'Documents', path: '/portal/documents', icon: DescriptionIcon },
  { label: 'Notifications', path: '/portal/notifications', icon: NotificationsIcon },
  { label: 'Profile', path: '/portal/profile', icon: PersonIcon },
];
