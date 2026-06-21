export const ROLES = {
  MASTER: 'Master',
  ADMIN: 'Admin',
  CUSTOMER: 'Customer',
};

export const ROLE_HIERARCHY = [ROLES.CUSTOMER, ROLES.ADMIN, ROLES.MASTER];

export const hasMinimumRole = (userRole, requiredRole) => {
  const userLevel = ROLE_HIERARCHY.indexOf(userRole);
  const requiredLevel = ROLE_HIERARCHY.indexOf(requiredRole);

  if (userLevel === -1 || requiredLevel === -1) {
    return false;
  }

  return userLevel >= requiredLevel;
};
