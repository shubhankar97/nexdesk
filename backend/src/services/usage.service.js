import { getPlatformModels } from '../config/database.js';
import {
  MODULES,
  getDocumentAiUploadLimit,
  hasModuleAccess,
  hasPlanFeature,
} from '../constants/modules.js';
import { ApiError } from '../utils/ApiError.js';

export const getUsagePeriodKey = (date = new Date()) => {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
};

export const getPeriodBounds = (periodKey) => {
  const [year, month] = periodKey.split('-').map(Number);
  const periodStart = new Date(Date.UTC(year, month - 1, 1, 0, 0, 0, 0));
  const periodEnd = new Date(Date.UTC(year, month, 0, 23, 59, 59, 999));
  return { periodStart, periodEnd };
};

export const getPlanForTenant = async (tenant) => {
  if (!tenant?.planId) {
    return null;
  }

  const { Plan } = getPlatformModels();
  const plan = await Plan.findOne({ planId: tenant.planId, isActive: true });
  return plan ? plan.toSafeObject() : null;
};

export const getOrCreateUsageCounter = async (tenantId, module = MODULES.DOCUMENT_AI) => {
  const { UsageCounter } = getPlatformModels();
  const periodKey = getUsagePeriodKey();

  let counter = await UsageCounter.findOne({ tenantId, module, periodKey });

  if (!counter) {
    try {
      counter = await UsageCounter.create({
        tenantId,
        module,
        periodKey,
        uploads: 0,
      });
    } catch (error) {
      if (error?.code === 11000) {
        counter = await UsageCounter.findOne({ tenantId, module, periodKey });
      } else {
        throw error;
      }
    }
  }

  return counter;
};

export const assertDocumentAiUploadAllowed = async (tenant, fileCount = 1) => {
  const plan = await getPlanForTenant(tenant);

  if (!hasModuleAccess(tenant, MODULES.DOCUMENT_AI, plan)) {
    throw new ApiError(
      403,
      'Document AI is not available on your plan. Enable the add-on and use a plan that includes document-ai.'
    );
  }

  const limit = getDocumentAiUploadLimit(plan);
  const counter = await getOrCreateUsageCounter(tenant.tenantId);
  const used = counter.uploads || 0;

  if (limit != null && used + fileCount > limit) {
    throw new ApiError(
      429,
      `Monthly Document AI upload limit reached (${used}/${limit}). Upgrade your plan or wait until next month.`
    );
  }

  return { plan, counter, limit, used };
};

export const incrementDocumentAiUploads = async (tenantId, fileCount = 1) => {
  const { UsageCounter } = getPlatformModels();
  const periodKey = getUsagePeriodKey();

  const counter = await UsageCounter.findOneAndUpdate(
    { tenantId, module: MODULES.DOCUMENT_AI, periodKey },
    { $inc: { uploads: fileCount }, $setOnInsert: { tenantId, module: MODULES.DOCUMENT_AI, periodKey } },
    { new: true, upsert: true }
  );

  return counter;
};

export const getDocumentAiUsageSummary = async (tenant) => {
  const plan = await getPlanForTenant(tenant);
  const periodKey = getUsagePeriodKey();
  const { periodStart, periodEnd } = getPeriodBounds(periodKey);
  const counter = await getOrCreateUsageCounter(tenant.tenantId);
  const limit = getDocumentAiUploadLimit(plan);
  const used = counter.uploads || 0;
  const unlimited = limit == null;
  const remaining = unlimited ? null : Math.max(0, limit - used);
  const accessAllowed = hasModuleAccess(tenant, MODULES.DOCUMENT_AI, plan);
  const planFeatureEnabled = hasPlanFeature(plan, MODULES.DOCUMENT_AI);
  const addonEnabled = Boolean(tenant?.addons?.documentAi);
  const planOverride = Boolean(tenant?.addons?.documentAiPlanOverride);

  return {
    module: MODULES.DOCUMENT_AI,
    periodKey,
    periodStart,
    periodEnd,
    uploads: {
      used,
      limit,
      remaining,
      unlimited,
    },
    plan: plan
      ? {
          planId: plan.planId,
          name: plan.name,
          slug: plan.slug,
          features: plan.features,
          limits: plan.limits,
        }
      : null,
    access: {
      allowed: accessAllowed,
      addonEnabled,
      planFeatureEnabled,
      planOverride,
    },
  };
};

export const enrichTenantWithPlan = async (tenant) => {
  const base = typeof tenant.toSafeObject === 'function' ? tenant.toSafeObject() : tenant;
  const plan = await getPlanForTenant(tenant);
  const accessAllowed = hasModuleAccess(base, MODULES.DOCUMENT_AI, plan);

  return {
    ...base,
    plan,
    planFeatures: plan?.features || [],
    entitlements: {
      [MODULES.DOCUMENT_AI]: {
        allowed: accessAllowed,
        addonEnabled: Boolean(base.addons?.documentAi),
        planFeatureEnabled: hasPlanFeature(plan, MODULES.DOCUMENT_AI),
        planOverride: Boolean(base.addons?.documentAiPlanOverride),
        uploadsPerMonth: getDocumentAiUploadLimit(plan),
      },
    },
  };
};
