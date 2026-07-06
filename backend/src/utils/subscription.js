import { SUBSCRIPTION_STATUS } from '../constants/subscription.js';

export const isSubscriptionExpired = (tenant) => {
  if (!tenant) {
    return true;
  }

  if (
    tenant.subscriptionStatus === SUBSCRIPTION_STATUS.EXPIRED ||
    tenant.subscriptionStatus === SUBSCRIPTION_STATUS.CANCELLED
  ) {
    return true;
  }

  if (tenant.currentPeriodEnd && tenant.currentPeriodEnd < new Date()) {
    return true;
  }

  return false;
};

export const isTenantAccessible = (tenant) => tenant?.isActive && !isSubscriptionExpired(tenant);
