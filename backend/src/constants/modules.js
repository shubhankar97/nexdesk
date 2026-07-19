export const MODULES = {
  DOCUMENT_AI: 'document-ai',
};

export const MODULE_ADDON_KEYS = {
  [MODULES.DOCUMENT_AI]: 'documentAi',
};

export const MODULE_PLAN_OVERRIDE_KEYS = {
  [MODULES.DOCUMENT_AI]: 'documentAiPlanOverride',
};

export const hasPlanFeature = (plan, featureKey) =>
  Boolean(plan?.features?.includes(featureKey));

/**
 * Document AI access:
 * - Master add-on must be enabled (addons.documentAi)
 * - Plan must include feature key OR Master set plan override
 */
export const hasModuleAccess = (tenant, moduleKey, plan = null) => {
  const addonKey = MODULE_ADDON_KEYS[moduleKey];

  if (!addonKey) {
    return false;
  }

  if (!tenant?.addons?.[addonKey]) {
    return false;
  }

  const overrideKey = MODULE_PLAN_OVERRIDE_KEYS[moduleKey];
  if (overrideKey && tenant?.addons?.[overrideKey]) {
    return true;
  }

  const resolvedPlan = plan || tenant?.plan || null;
  const features = resolvedPlan?.features || tenant?.planFeatures || null;

  if (!features) {
    return false;
  }

  return hasPlanFeature({ features }, moduleKey);
};

export const getDocumentAiUploadLimit = (plan) => {
  const limit = plan?.limits?.documentAi?.uploadsPerMonth;

  if (limit === null || limit === undefined) {
    return null; // unlimited
  }

  const numeric = Number(limit);
  return Number.isFinite(numeric) ? numeric : null;
};
