export const SUBSCRIPTION_STATUS = {
  TRIALING: 'trialing',
  ACTIVE: 'active',
  PAST_DUE: 'past_due',
  CANCELLED: 'cancelled',
  EXPIRED: 'expired',
};

export const BILLING_INTERVAL = {
  MONTHLY: 'monthly',
  YEARLY: 'yearly',
};

export const ACTIVE_SUBSCRIPTION_STATUSES = [
  SUBSCRIPTION_STATUS.TRIALING,
  SUBSCRIPTION_STATUS.ACTIVE,
  SUBSCRIPTION_STATUS.PAST_DUE,
];
