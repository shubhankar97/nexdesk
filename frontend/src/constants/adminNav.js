import DashboardIcon from '@mui/icons-material/Dashboard';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import PeopleIcon from '@mui/icons-material/People';
import AssessmentIcon from '@mui/icons-material/Assessment';
import NotificationsIcon from '@mui/icons-material/Notifications';
import SettingsIcon from '@mui/icons-material/Settings';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import { MODULES } from './modules.js';

export const ADMIN_NAV_ITEMS = [
  { label: 'Dashboard', path: '/', icon: DashboardIcon },
  { label: 'Orders', path: '/orders', icon: ShoppingCartIcon, module: MODULES.ORDERS },
  { label: 'Customers', path: '/customers', icon: PeopleIcon, module: MODULES.CUSTOMERS },
  { label: 'Reports', path: '/reports', icon: AssessmentIcon, module: MODULES.REPORTS },
  {
    label: 'Document AI',
    path: '/document-ai',
    icon: AutoAwesomeIcon,
    module: MODULES.DOCUMENT_AI,
  },
  {
    label: 'Notifications',
    path: '/notifications',
    icon: NotificationsIcon,
    module: MODULES.NOTIFICATIONS,
  },
  { label: 'Settings', path: '/settings', icon: SettingsIcon, module: MODULES.SETTINGS },
];
