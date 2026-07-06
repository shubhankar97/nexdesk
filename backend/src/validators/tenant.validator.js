import { ApiError } from '../utils/ApiError.js';

const SUBDOMAIN_PATTERN = /^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?$/;

export const validateTenantId = (input) => {
  const tenantId = input?.tenantId ?? input;

  if (!tenantId || typeof tenantId !== 'string') {
    throw new ApiError(400, 'Tenant ID is required');
  }

  return { tenantId: tenantId.trim() };
};

export const validateCreateTenant = (body) => {
  const { companyName, subdomain, isActive } = body ?? {};

  if (!companyName?.trim()) {
    throw new ApiError(400, 'Company name is required');
  }

  if (!subdomain?.trim()) {
    throw new ApiError(400, 'Subdomain is required');
  }

  const normalizedSubdomain = subdomain.trim().toLowerCase();

  if (!SUBDOMAIN_PATTERN.test(normalizedSubdomain)) {
    throw new ApiError(400, 'Subdomain must be lowercase alphanumeric with optional hyphens');
  }

  return {
    companyName: companyName.trim(),
    subdomain: normalizedSubdomain,
    isActive: isActive !== false,
  };
};

export const validateUpdateTenant = (body) => {
  const { companyName, isActive } = body ?? {};
  const payload = {};

  if (companyName !== undefined) {
    if (!companyName?.trim()) {
      throw new ApiError(400, 'Company name cannot be empty');
    }

    payload.companyName = companyName.trim();
  }

  if (isActive !== undefined) {
    payload.isActive = Boolean(isActive);
  }

  if (!Object.keys(payload).length) {
    throw new ApiError(400, 'No valid fields to update');
  }

  return payload;
};
