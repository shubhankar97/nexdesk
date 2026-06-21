import { getTenantId } from '../context/tenantContext.js';

/**
 * Returns a MongoDB filter fragment scoped to the current tenant.
 */
export const tenantFilter = (extraFilter = {}) => {
  const tenantId = getTenantId();

  if (!tenantId) {
    return { ...extraFilter };
  }

  return { tenantId, ...extraFilter };
};

/**
 * Ensures a document belongs to the current tenant before returning it.
 */
export const assertTenantMatch = (document) => {
  const tenantId = getTenantId();

  if (!tenantId || !document) {
    return document;
  }

  if (document.tenantId && document.tenantId !== tenantId) {
    return null;
  }

  return document;
};
