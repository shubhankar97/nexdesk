import { ApiError } from '../utils/ApiError.js';

const SUBDOMAIN_PATTERN = /^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?$/;

export const validateTenantId = (input) => {
  const tenantId = input?.tenantId ?? input;

  if (!tenantId || typeof tenantId !== 'string') {
    throw new ApiError(400, 'Tenant ID is required');
  }

  return { tenantId: tenantId.trim() };
};

const parseDocumentAiAddons = (addons) => {
  if (addons === undefined) {
    return undefined;
  }

  if (addons === null || typeof addons !== 'object' || Array.isArray(addons)) {
    throw new ApiError(400, 'Addons must be an object');
  }

  const payload = {};

  if (addons.documentAi !== undefined) {
    payload.documentAi = Boolean(addons.documentAi);
  }

  if (addons.documentAiPlanOverride !== undefined) {
    payload.documentAiPlanOverride = Boolean(addons.documentAiPlanOverride);
  }

  if (!Object.keys(payload).length) {
    return undefined;
  }

  return payload;
};

export const validateCreateTenant = (body) => {
  const { companyName, subdomain, isActive, addons } = body ?? {};

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

  const payload = {
    companyName: companyName.trim(),
    subdomain: normalizedSubdomain,
    isActive: isActive !== false,
  };

  const documentAiAddons = parseDocumentAiAddons(addons);

  if (documentAiAddons !== undefined) {
    payload.addons = documentAiAddons;
  }

  return payload;
};

export const validateUpdateTenant = (body) => {
  const { companyName, isActive, addons } = body ?? {};
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

  const documentAiAddons = parseDocumentAiAddons(addons);

  if (documentAiAddons !== undefined) {
    payload.addons = documentAiAddons;
  }

  if (!Object.keys(payload).length) {
    throw new ApiError(400, 'No valid fields to update');
  }

  return payload;
};
