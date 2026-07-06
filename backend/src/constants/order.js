export const ORDER_STATUS = {
  EXPIRED: 'Expired',
  ACTIVE: 'Active',
  DUE_FOR_RENEWAL: 'Due for renewal',
};

export const RENEWAL_WINDOW_DAYS = 30;

export const computeOrderStatus = (validity, nextRenewal) => {
  const now = new Date();

  if (validity < now) {
    return ORDER_STATUS.EXPIRED;
  }

  const renewalThreshold = new Date(now);
  renewalThreshold.setDate(renewalThreshold.getDate() + RENEWAL_WINDOW_DAYS);

  if (nextRenewal <= renewalThreshold) {
    return ORDER_STATUS.DUE_FOR_RENEWAL;
  }

  return ORDER_STATUS.ACTIVE;
};
