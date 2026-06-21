import { Tenant } from '../models/Tenant.js';
import { TENANT_HEADER } from '../constants/tenant.js';
import { env } from '../config/env.js';
import { getTenantContext, runWithTenantContext } from '../context/tenantContext.js';
import { extractSubdomain } from '../utils/subdomain.js';
import { ApiError } from '../utils/ApiError.js';

const resolveSubdomain = (req) => {
  if (env.allowTenantHeader && req.headers[TENANT_HEADER]) {
    return String(req.headers[TENANT_HEADER]).toLowerCase().trim();
  }

  return extractSubdomain(req.headers.host, env.baseDomain);
};

export const resolveTenant = async (req, _res, next) => {
  try {
    const subdomain = resolveSubdomain(req);

    if (!subdomain) {
      req.tenant = null;
      req.tenantId = null;
      return next();
    }

    const tenant = await Tenant.findOne({ subdomain, isActive: true });

    if (!tenant) {
      req.tenant = null;
      req.tenantId = null;
      return next();
    }

    req.tenant = tenant;
    req.tenantId = tenant.tenantId;

    return next();
  } catch (error) {
    return next(error);
  }
};

export const requireTenant = (req, _res, next) => {
  if (!req.tenant || !req.tenantId) {
    return next(new ApiError(400, 'Valid tenant subdomain is required'));
  }

  return next();
};

export const bindTenantContext = (req, _res, next) => {
  if (!req.tenantId) {
    return next();
  }

  const existingContext = getTenantContext();

  if (existingContext?.tenantId === req.tenantId) {
    return next();
  }

  return runWithTenantContext(
    { tenant: req.tenant, tenantId: req.tenantId },
    () => next()
  );
};

export const enforceTenantAccess = (req, _res, next) => {
  if (!req.user?.tenantId) {
    return next();
  }

  if (!req.tenantId) {
    return next(new ApiError(403, 'Tenant context required'));
  }

  if (req.user.tenantId !== req.tenantId) {
    return next(new ApiError(403, 'Access denied for this tenant'));
  }

  return next();
};
