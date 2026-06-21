export const ROLES = {
  MASTER: 'Master',
  ADMIN: 'Admin',
  CUSTOMER: 'Customer',
};

export const ROLE_LABELS = {
  [ROLES.MASTER]: 'Master',
  [ROLES.ADMIN]: 'Admin',
  [ROLES.CUSTOMER]: 'Customer',
};

export const getLoginPath = (role) => (role === ROLES.MASTER ? '/master' : '/login');

export const PROFILE_PATHS = {
  [ROLES.MASTER]: '/master/profile',
  [ROLES.ADMIN]: '/profile',
  [ROLES.CUSTOMER]: '/portal/profile',
};
