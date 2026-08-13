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

export const VALIDITY_DURATION_OPTIONS = [
  { value: '1m', label: '1 Month', months: 1 },
  { value: '3m', label: '3 Months', months: 3 },
  { value: '6m', label: '6 Months', months: 6 },
  { value: '1y', label: '1 Year', months: 12 },
];
