export const MODULES = {
  DOCUMENT_AI: 'document-ai',
  ORDERS: 'orders',
  CUSTOMERS: 'customers',
  REPORTS: 'reports',
  NOTIFICATIONS: 'notifications',
  SETTINGS: 'settings',
  CUSTOMER_DOCUMENTS: 'customer-documents',
};

export const MODULE_ADDON_KEYS = {
  [MODULES.DOCUMENT_AI]: 'documentAi',
  [MODULES.ORDERS]: 'orders',
  [MODULES.CUSTOMERS]: 'customers',
  [MODULES.REPORTS]: 'reports',
  [MODULES.NOTIFICATIONS]: 'notifications',
  [MODULES.SETTINGS]: 'settings',
  [MODULES.CUSTOMER_DOCUMENTS]: 'customerDocuments',
};

/** Only Document AI uses plan feature + override. Other modules are Master toggle only. */
export const MODULE_PLAN_OVERRIDE_KEYS = {
  [MODULES.DOCUMENT_AI]: 'documentAiPlanOverride',
};

/** Defaults when addon field is missing (existing tenants stay unlocked). */
export const MODULE_DEFAULT_ENABLED = {
  [MODULES.DOCUMENT_AI]: false,
  [MODULES.ORDERS]: true,
  [MODULES.CUSTOMERS]: true,
  [MODULES.REPORTS]: true,
  [MODULES.NOTIFICATIONS]: true,
  [MODULES.SETTINGS]: true,
  [MODULES.CUSTOMER_DOCUMENTS]: true,
};

export const MASTER_MODULE_TOGGLES = [
  {
    addonKey: 'orders',
    module: MODULES.ORDERS,
    label: 'Orders (Admin & Customer)',
  },
  {
    addonKey: 'customers',
    module: MODULES.CUSTOMERS,
    label: 'Customers (Admin)',
  },
  {
    addonKey: 'reports',
    module: MODULES.REPORTS,
    label: 'Reports (Admin)',
  },
  {
    addonKey: 'notifications',
    module: MODULES.NOTIFICATIONS,
    label: 'Notifications (Admin & Customer)',
  },
  {
    addonKey: 'settings',
    module: MODULES.SETTINGS,
    label: 'Settings (Admin)',
  },
  {
    addonKey: 'customerDocuments',
    module: MODULES.CUSTOMER_DOCUMENTS,
    label: 'Documents (Customer)',
  },
  {
    addonKey: 'documentAi',
    module: MODULES.DOCUMENT_AI,
    label: 'Document AI add-on',
    hasPlanOverride: true,
  },
];

export const hasPlanFeature = (plan, featureKey) =>
  Boolean(plan?.features?.includes(featureKey));

const isAddonEnabled = (tenant, moduleKey) => {
  const addonKey = MODULE_ADDON_KEYS[moduleKey];
  const value = tenant?.addons?.[addonKey];

  if (value === undefined || value === null) {
    return MODULE_DEFAULT_ENABLED[moduleKey] ?? false;
  }

  return Boolean(value);
};

/**
 * Module access:
 * - Master-toggle modules: tenant addon flag (defaults on except Document AI)
 * - Document AI: add-on must be on, and plan must include feature OR Master override
 */
export const hasModuleAccess = (tenant, moduleKey, plan = null) => {
  const addonKey = MODULE_ADDON_KEYS[moduleKey];

  if (!addonKey) {
    return false;
  }

  if (!isAddonEnabled(tenant, moduleKey)) {
    return false;
  }

  const overrideKey = MODULE_PLAN_OVERRIDE_KEYS[moduleKey];

  if (!overrideKey) {
    return true;
  }

  if (tenant?.addons?.[overrideKey]) {
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
    return null;
  }

  const numeric = Number(limit);
  return Number.isFinite(numeric) ? numeric : null;
};
