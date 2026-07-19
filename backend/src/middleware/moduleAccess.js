import { MODULES, hasModuleAccess } from '../constants/modules.js';
import { ROLES } from '../constants/roles.js';
import { ApiError } from '../utils/ApiError.js';
import * as usageService from '../services/usage.service.js';

export const requireModule = (moduleKey = MODULES.DOCUMENT_AI) => async (req, _res, next) => {
  try {
    if (!req.user) {
      return next(new ApiError(401, 'Authentication required'));
    }

    if (req.user.role === ROLES.MASTER) {
      return next();
    }

    if (!req.tenant) {
      return next(new ApiError(400, 'Valid tenant subdomain is required'));
    }

    const plan = await usageService.getPlanForTenant(req.tenant);
    req.plan = plan;

    if (!hasModuleAccess(req.tenant, moduleKey, plan)) {
      return next(
        new ApiError(
          403,
          'Module not enabled for this tenant. Require add-on plus plan feature (or Master plan override).'
        )
      );
    }

    return next();
  } catch (error) {
    return next(error);
  }
};
