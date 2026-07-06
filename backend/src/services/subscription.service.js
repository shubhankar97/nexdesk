import { SUBSCRIPTION_STATUS } from '../constants/subscription.js';
import { getPlatformModels } from '../config/database.js';
import { env } from '../config/env.js';
import * as planRepository from '../repositories/plan.repository.js';
import { ApiError } from '../utils/ApiError.js';
import { isSubscriptionExpired } from '../utils/subscription.js';
import * as payuService from './payu.service.js';

const BILLING_PERIOD_MS = {
  monthly: 30 * 24 * 60 * 60 * 1000,
  yearly: 365 * 24 * 60 * 60 * 1000,
};

const addPeriod = (startDate, interval) =>
  new Date(startDate.getTime() + (BILLING_PERIOD_MS[interval] ?? BILLING_PERIOD_MS.monthly));

const formatPlan = (plan) => plan.toSafeObject();

const formatSubscription = (tenant, plan) => ({
  tenantId: tenant.tenantId,
  plan: plan ? formatPlan(plan) : null,
  subscriptionStatus: tenant.subscriptionStatus,
  currentPeriodStart: tenant.currentPeriodStart,
  currentPeriodEnd: tenant.currentPeriodEnd,
  isExpired: isSubscriptionExpired(tenant),
  payuConfigured: payuService.isPayuConfigured(),
});

export const listPlans = async () => {
  const plans = await planRepository.findPlans({ isActive: true });
  return plans.map(formatPlan);
};

export const getPlanById = async (planId) => {
  const plan = await planRepository.findPlanById(planId);

  if (!plan || !plan.isActive) {
    throw new ApiError(404, 'Plan not found');
  }

  return formatPlan(plan);
};

export const createPlan = async (data) => {
  const existing = await planRepository.findPlanBySlug(data.slug);

  if (existing) {
    throw new ApiError(409, 'Plan slug already exists');
  }

  const plan = await planRepository.createPlan(data);
  return formatPlan(plan);
};

export const updatePlan = async (planId, data) => {
  const plan = await planRepository.updatePlan(planId, data);

  if (!plan) {
    throw new ApiError(404, 'Plan not found');
  }

  return formatPlan(plan);
};

export const getTenantSubscription = async (tenant) => {
  const plan = tenant.planId ? await planRepository.findPlanById(tenant.planId) : null;
  return formatSubscription(tenant, plan);
};

export const assignPlanToTenant = async (tenant, planId) => {
  const plan = await planRepository.findPlanById(planId);

  if (!plan || !plan.isActive) {
    throw new ApiError(404, 'Plan not found');
  }

  const now = new Date();
  tenant.planId = plan.planId;
  tenant.subscriptionStatus = plan.trialDays > 0 ? SUBSCRIPTION_STATUS.TRIALING : SUBSCRIPTION_STATUS.ACTIVE;
  tenant.currentPeriodStart = now;
  tenant.currentPeriodEnd = plan.trialDays > 0
    ? new Date(now.getTime() + plan.trialDays * 24 * 60 * 60 * 1000)
    : addPeriod(now, plan.interval);

  await tenant.save();
  return formatSubscription(tenant, plan);
};

export const createCheckout = async (tenant, planId, { email, phone } = {}) => {
  const plan = await planRepository.findPlanById(planId);

  if (!plan || !plan.isActive) {
    throw new ApiError(404, 'Plan not found');
  }

  if (!payuService.isPayuConfigured()) {
    throw new ApiError(503, 'PayU is not configured');
  }

  const billingEmail = email || `billing+${tenant.subdomain}@${env.billingEmailDomain}`;
  const checkout = payuService.buildSubscriptionCheckout({
    tenant,
    plan,
    email: billingEmail,
    phone,
  });

  return {
    txnid: checkout.txnid,
    paymentUrl: checkout.paymentUrl,
    params: checkout.params,
    plan: formatPlan(plan),
  };
};

export const applySubscriptionFromPayment = async (payload) => {
  const tenantId = payload.udf1;
  const planId = payload.udf2;

  if (!tenantId) {
    return null;
  }

  const { Tenant } = getPlatformModels();
  const tenant = await Tenant.findOne({ tenantId });

  if (!tenant) {
    return null;
  }

  const plan = planId ? await planRepository.findPlanById(planId) : null;
  const now = new Date();

  if (payload.mihpayid) {
    tenant.payuSubscriptionId = payload.mihpayid;
  }

  if (payload.status === 'success') {
    tenant.subscriptionStatus = SUBSCRIPTION_STATUS.ACTIVE;
    tenant.currentPeriodStart = now;
    tenant.currentPeriodEnd = plan ? addPeriod(now, plan.interval) : tenant.currentPeriodEnd;

    if (plan) {
      tenant.planId = plan.planId;
    }
  } else if (payload.status === 'failure') {
    tenant.subscriptionStatus = SUBSCRIPTION_STATUS.PAST_DUE;
  }

  await tenant.save();
  return tenant;
};

const mapPayuZionStatus = (status) => {
  const statusMap = {
    Defined: SUBSCRIPTION_STATUS.TRIALING,
    Enabled: SUBSCRIPTION_STATUS.ACTIVE,
    Completed: SUBSCRIPTION_STATUS.EXPIRED,
    Cancelled: SUBSCRIPTION_STATUS.CANCELLED,
  };

  return statusMap[status] ?? SUBSCRIPTION_STATUS.ACTIVE;
};

export const applySubscriptionFromZion = async (payload) => {
  const customParams = payload.customParameter ?? payload.customParameters ?? {};
  const tenantId = customParams.tenantId ?? customParams.udf1;

  if (!tenantId) {
    return null;
  }

  const { Tenant } = getPlatformModels();
  const tenant = await Tenant.findOne({ tenantId });

  if (!tenant) {
    return null;
  }

  const planId = customParams.planId ?? customParams.udf2;
  const plan = planId ? await planRepository.findPlanById(planId) : null;

  if (payload.subscriptionId) {
    tenant.payuSubscriptionId = String(payload.subscriptionId);
  }

  if (payload.status) {
    tenant.subscriptionStatus = mapPayuZionStatus(payload.status);
  }

  if (plan) {
    tenant.planId = plan.planId;
  }

  const now = new Date();

  if (tenant.subscriptionStatus === SUBSCRIPTION_STATUS.ACTIVE && plan) {
    tenant.currentPeriodStart = now;
    tenant.currentPeriodEnd = addPeriod(now, plan.interval);
  }

  await tenant.save();
  return tenant;
};

export const handlePaymentWebhook = async (payload) => {
  if (!payuService.verifyResponseHash(payload)) {
    throw new ApiError(400, 'Invalid PayU payment hash');
  }

  if (payload.status !== 'success') {
    return applySubscriptionFromPayment(payload);
  }

  if (payload.txnid) {
    try {
      await payuService.verifyPayment(payload.txnid);
    } catch {
      // Webhook hash is verified; proceed with status update
    }
  }

  return applySubscriptionFromPayment(payload);
};

export const handleZionWebhook = async (payload) => {
  const eventType = payload.event ?? payload.eventType;

  switch (eventType) {
    case 'SUBSCRIPTION_DEFINED_HTTP':
    case 'SUBSCRIPTION_ENABLED_HTTP':
    case 'SUBSCRIPTION_COMPLETED_HTTP':
    case 'SUBSCRIPTION_CANCELLED_HTTP':
      return applySubscriptionFromZion(payload);

    default:
      return null;
  }
};
