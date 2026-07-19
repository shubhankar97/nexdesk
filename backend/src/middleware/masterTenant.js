import { getPlatformModels } from '../config/database.js';
import { ROLES } from '../constants/roles.js';
import { TENANT_HEADER } from '../constants/tenant.js';
import { getTenantModelsForTenant } from '../database/tenantConnection.js';
import { runWithTenantContext } from '../context/tenantContext.js';
import { ApiError } from '../utils/ApiError.js';

/**
 * Lets Master select a tenant via x-tenant-subdomain when on the platform host.
 * Re-binds tenant models into ALS so repositories work.
 */
export const allowMasterTenantOverride = async (req, _res, next) => {
  try {
    if (req.user?.role !== ROLES.MASTER) {
      return next();
    }

    if (req.tenant) {
      return next();
    }

    const subdomain = req.headers[TENANT_HEADER]
      ? String(req.headers[TENANT_HEADER]).toLowerCase().trim()
      : null;

    if (!subdomain) {
      return next();
    }

    const { Tenant } = getPlatformModels();
    const tenant = await Tenant.findOne({ subdomain });

    if (!tenant) {
      return next(new ApiError(404, 'Tenant not found'));
    }

    req.tenant = tenant;
    req.tenantId = tenant.tenantId;

    const { connection, models } = await getTenantModelsForTenant(tenant);

    return runWithTenantContext(
      {
        tenant: req.tenant,
        tenantId: req.tenantId,
        connection,
        models,
      },
      () => next()
    );
  } catch (error) {
    return next(error);
  }
};
