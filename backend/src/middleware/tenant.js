import { getTenantModelsForTenant } from '../database/tenantConnection.js';
import { getPlatformModels } from '../database/platformModels.js';
import { TENANT_HEADER } from '../constants/tenant.js';
import { env } from '../config/env.js';
import { runWithTenantContext } from '../context/tenantContext.js';
import { extractSubdomain } from '../utils/subdomain.js';
import { ApiError } from '../utils/ApiError.js';
import { isSubscriptionExpired } from '../utils/subscription.js';

const resolveSubdomain = (req) => {
  if (env.allowTenantHeader && req.headers[TENANT_HEADER]) {
    return String(req.headers[TENANT_HEADER]).toLowerCase().trim();
  }

  return extractSubdomain(req.headers.host, env.rootDomain, env.appSubdomain);
};

export const resolveTenant = async (req, _res, next) => {
  try {
    const subdomain = resolveSubdomain(req);

    if (!subdomain) {
      req.tenant = null;
      req.tenantId = null;
      return next();
    }

    const { Tenant: TenantModel } = getPlatformModels();
    const tenant = await TenantModel.findOne({ subdomain });

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

export const requireActiveTenant = (req, _res, next) => {
  if (!req.tenant) {
    return next(new ApiError(400, 'Valid tenant subdomain is required'));
  }

  if (!req.tenant.isActive) {
    return next(new ApiError(403, 'Tenant account is deactivated'));
  }

  if (isSubscriptionExpired(req.tenant)) {
    return next(new ApiError(402, 'Subscription expired'));
  }

  return next();
};

export const requirePlatformHost = (req, _res, next) => {
  const subdomain = extractSubdomain(req.headers.host, env.rootDomain, env.appSubdomain);

  if (subdomain) {
    return next(new ApiError(403, 'This endpoint is not available on tenant subdomains'));
  }

  return next();
};

export const bindTenantContext = (req, _res, next) => {
  if (!req.tenantId || !req.tenant) {
    return next();
  }

  getTenantModelsForTenant(req.tenant)
    .then(({ connection, models }) =>
      runWithTenantContext(
        {
          tenant: req.tenant,
          tenantId: req.tenantId,
          connection,
          models,
        },
        () => next()
      )
    )
    .catch(next);
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
