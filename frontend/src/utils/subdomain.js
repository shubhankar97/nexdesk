import { PLATFORM_SUBDOMAINS } from '../constants/tenant.js';
import { env } from '../config/env.js';

export const getTenantZone = (rootDomain = env.rootDomain, appSubdomain = env.appSubdomain) =>
  `${appSubdomain}.${rootDomain}`;

export const getTenantHost = (
  tenantSubdomain,
  rootDomain = env.rootDomain,
  appSubdomain = env.appSubdomain
) => `${tenantSubdomain}.${getTenantZone(rootDomain, appSubdomain)}`;

/**
 * Extract tenant subdomain from hostname.
 * Examples: abc.nexdesk.localhost -> abc, abc.nexdesk.worzest.com -> abc
 */
export const extractSubdomain = (
  hostname,
  rootDomain = env.rootDomain,
  appSubdomain = env.appSubdomain
) => {
  if (!hostname || !rootDomain || !appSubdomain) {
    return null;
  }

  const host = hostname.toLowerCase();
  const tenantZone = getTenantZone(rootDomain, appSubdomain);

  if (host === rootDomain || host === tenantZone) {
    return null;
  }

  const tenantSuffix = `.${tenantZone}`;

  if (!host.endsWith(tenantSuffix)) {
    return null;
  }

  const subdomain = host.slice(0, -tenantSuffix.length);

  if (!subdomain || PLATFORM_SUBDOMAINS.includes(subdomain)) {
    return null;
  }

  return subdomain;
};

export const getTenantSubdomain = () => {
  if (typeof window === 'undefined') {
    return null;
  }

  return extractSubdomain(window.location.hostname);
};

export const isTenantSubdomain = () => Boolean(getTenantSubdomain());
