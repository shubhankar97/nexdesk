export const ORDER_STATUS = {
  EXPIRED: 'Expired',
  ACTIVE: 'Active',
  DUE_FOR_RENEWAL: 'Due for renewal',
};

export const ORDER_STATUS_OPTIONS = Object.values(ORDER_STATUS);

export const ORDER_STATUS_COLORS = {
  [ORDER_STATUS.EXPIRED]: 'error',
  [ORDER_STATUS.ACTIVE]: 'success',
  [ORDER_STATUS.DUE_FOR_RENEWAL]: 'warning',
};
