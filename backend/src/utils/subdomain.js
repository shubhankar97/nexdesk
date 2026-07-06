import { PLATFORM_SUBDOMAINS } from '../constants/tenant.js';

export const getTenantZone = (rootDomain, appSubdomain) => `${appSubdomain}.${rootDomain}`;

export const getTenantHost = (tenantSubdomain, rootDomain, appSubdomain) =>
  `${tenantSubdomain}.${getTenantZone(rootDomain, appSubdomain)}`;

/**
 * Extract tenant subdomain from Host header.
 * Examples: abc.nexdesk.localhost -> abc, abc.nexdesk.worzest.com -> abc
 */
export const extractSubdomain = (host, rootDomain, appSubdomain) => {
  if (!host || !rootDomain || !appSubdomain) {
    return null;
  }

  const hostname = host.split(':')[0].toLowerCase();
  const tenantZone = getTenantZone(rootDomain, appSubdomain);

  if (hostname === rootDomain || hostname === tenantZone) {
    return null;
  }

  const tenantSuffix = `.${tenantZone}`;

  if (!hostname.endsWith(tenantSuffix)) {
    return null;
  }

  const subdomain = hostname.slice(0, -tenantSuffix.length);

  if (!subdomain || PLATFORM_SUBDOMAINS.includes(subdomain)) {
    return null;
  }

  return subdomain;
};
