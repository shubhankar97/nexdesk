export const PARSE_STATUS = {
  PENDING: 'pending',
  VALID: 'valid',
  PARTIAL: 'partial',
  INVALID: 'invalid',
  FAILED: 'failed',
};

export const getParseStatusColor = (status) => {
  switch (status) {
    case PARSE_STATUS.VALID:
      return 'success';
    case PARSE_STATUS.PARTIAL:
      return 'warning';
    case PARSE_STATUS.INVALID:
    case PARSE_STATUS.FAILED:
      return 'error';
    case PARSE_STATUS.PENDING:
      return 'default';
    default:
      return 'default';
  }
};
