import { PLATFORM_SUBDOMAINS } from '../constants/tenant.js';
import { env } from '../config/env.js';

/**
 * Extract tenant subdomain from hostname.
 * Examples: abc.coregent.com -> abc, abc.localhost -> abc
 */
export const extractSubdomain = (hostname, baseDomain = env.baseDomain) => {
  if (!hostname) {
    return null;
  }

  const host = hostname.toLowerCase();

  if (host === 'localhost' || host === baseDomain) {
    return null;
  }

  if (host.endsWith('.localhost')) {
    const subdomain = host.slice(0, -'.localhost'.length);
    return subdomain && !PLATFORM_SUBDOMAINS.includes(subdomain) ? subdomain : null;
  }

  if (baseDomain && host.endsWith(`.${baseDomain}`)) {
    const subdomain = host.slice(0, -(baseDomain.length + 1));
    return subdomain && !PLATFORM_SUBDOMAINS.includes(subdomain) ? subdomain : null;
  }

  const parts = host.split('.');

  if (parts.length >= 3) {
    const subdomain = parts[0];
    return PLATFORM_SUBDOMAINS.includes(subdomain) ? null : subdomain;
  }

  return null;
};

export const getTenantSubdomain = () => {
  if (typeof window === 'undefined') {
    return null;
  }

  return extractSubdomain(window.location.hostname);
};

export const isTenantSubdomain = () => Boolean(getTenantSubdomain());
