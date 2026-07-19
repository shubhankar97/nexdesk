import DashboardIcon from '@mui/icons-material/Dashboard';
import BusinessIcon from '@mui/icons-material/Business';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import PeopleIcon from '@mui/icons-material/People';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';

export const MASTER_NAV_ITEMS = [
  { label: 'Dashboard', path: '/master', icon: DashboardIcon },
  { label: 'Tenants', path: '/master/tenants', icon: BusinessIcon },
  { label: 'Admins', path: '/master/admins', icon: AdminPanelSettingsIcon },
  { label: 'Customers', path: '/master/customers', icon: PeopleIcon },
  { label: 'Document AI', path: '/master/document-ai', icon: AutoAwesomeIcon },
];
