import { PLATFORM_SUBDOMAINS } from '../constants/tenant.js';

/**
 * Extract tenant subdomain from Host header.
 * Examples: abc.coregent.com -> abc, abc.localhost -> abc
 */
export const extractSubdomain = (host, baseDomain) => {
  if (!host) {
    return null;
  }

  const hostname = host.split(':')[0].toLowerCase();

  if (hostname === 'localhost' || hostname === baseDomain) {
    return null;
  }

  if (hostname.endsWith('.localhost')) {
    const subdomain = hostname.slice(0, -'.localhost'.length);
    return subdomain && !PLATFORM_SUBDOMAINS.includes(subdomain) ? subdomain : null;
  }

  if (baseDomain && hostname.endsWith(`.${baseDomain}`)) {
    const subdomain = hostname.slice(0, -(baseDomain.length + 1));
    return subdomain && !PLATFORM_SUBDOMAINS.includes(subdomain) ? subdomain : null;
  }

  const parts = hostname.split('.');

  if (parts.length >= 3) {
    const subdomain = parts[0];
    return PLATFORM_SUBDOMAINS.includes(subdomain) ? null : subdomain;
  }

  return null;
};
