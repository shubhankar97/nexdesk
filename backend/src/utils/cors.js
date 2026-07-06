import { env } from '../config/env.js';

export const isAllowedCorsOrigin = (origin) => {
  if (!origin) {
    return true;
  }

  if (origin === env.corsOrigin) {
    return true;
  }

  try {
    const { hostname } = new URL(origin);
    const tenantZone = `${env.appSubdomain}.${env.rootDomain}`;

    if (hostname === env.rootDomain || hostname === tenantZone) {
      return true;
    }

    if (hostname.endsWith(`.${tenantZone}`)) {
      return true;
    }

    if (env.rootDomain === 'localhost' && hostname.endsWith('.localhost')) {
      return true;
    }
  } catch {
    return false;
  }

  return false;
};
