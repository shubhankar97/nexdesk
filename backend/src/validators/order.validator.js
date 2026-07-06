import { ORDER_STATUS } from '../constants/order.js';
import { ApiError } from '../utils/ApiError.js';

const ORDER_STATUS_VALUES = Object.values(ORDER_STATUS);

const parseDate = (value, field, errors) => {
  if (value === undefined || value === null || value === '') {
    return null;
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    errors.push({ field, message: 'Invalid date format' });
    return null;
  }

  return date;
};

const validateObjectId = (value, field, errors) => {
  if (!value?.trim()) {
    errors.push({ field, message: `${field} is required` });
    return null;
  }

  if (!/^[a-fA-F0-9]{24}$/.test(value.trim())) {
    errors.push({ field, message: `Invalid ${field}` });
    return null;
  }

  return value.trim();
};

export const validateOrderId = (params) => {
  const errors = [];
  const id = validateObjectId(params.id, 'id', errors);

  if (errors.length) {
    throw new ApiError(400, 'Validation failed', errors);
  }

  return { id };
};

export const validateCreateOrder = (body) => {
  const errors = [];
  const { certificateName, issueDate, validity, nextRenewal, customer } = body;

  if (!certificateName?.trim()) {
    errors.push({ field: 'certificateName', message: 'Certificate name is required' });
  }

  const parsedIssueDate = parseDate(issueDate, 'issueDate', errors);
  const parsedValidity = parseDate(validity, 'validity', errors);
  const parsedNextRenewal = parseDate(nextRenewal, 'nextRenewal', errors);
  const customerId = validateObjectId(customer, 'customer', errors);

  if (parsedIssueDate && parsedValidity && parsedIssueDate > parsedValidity) {
    errors.push({ field: 'validity', message: 'Validity must be on or after issue date' });
  }

  if (parsedValidity && parsedNextRenewal && parsedNextRenewal > parsedValidity) {
    errors.push({
      field: 'nextRenewal',
      message: 'Next renewal must be on or before validity date',
    });
  }

  if (errors.length) {
    throw new ApiError(400, 'Validation failed', errors);
  }

  return {
    certificateName: certificateName.trim(),
    issueDate: parsedIssueDate,
    validity: parsedValidity,
    nextRenewal: parsedNextRenewal,
    customer: customerId,
  };
};

export const validateUpdateOrder = (body) => {
  const errors = [];
  const { certificateName, issueDate, validity, nextRenewal, customer } = body;
  const payload = {};

  if (certificateName !== undefined) {
    if (!certificateName?.trim()) {
      errors.push({ field: 'certificateName', message: 'Certificate name cannot be empty' });
    } else {
      payload.certificateName = certificateName.trim();
    }
  }

  if (issueDate !== undefined) {
    payload.issueDate = parseDate(issueDate, 'issueDate', errors);
  }

  if (validity !== undefined) {
    payload.validity = parseDate(validity, 'validity', errors);
  }

  if (nextRenewal !== undefined) {
    payload.nextRenewal = parseDate(nextRenewal, 'nextRenewal', errors);
  }

  if (customer !== undefined) {
    payload.customer = validateObjectId(customer, 'customer', errors);
  }

  if (!Object.keys(payload).length) {
    errors.push({ field: 'body', message: 'At least one field is required to update' });
  }

  const resolvedIssueDate = payload.issueDate;
  const resolvedValidity = payload.validity;
  const resolvedNextRenewal = payload.nextRenewal;

  if (resolvedIssueDate && resolvedValidity && resolvedIssueDate > resolvedValidity) {
    errors.push({ field: 'validity', message: 'Validity must be on or after issue date' });
  }

  if (resolvedValidity && resolvedNextRenewal && resolvedNextRenewal > resolvedValidity) {
    errors.push({
      field: 'nextRenewal',
      message: 'Next renewal must be on or before validity date',
    });
  }

  if (errors.length) {
    throw new ApiError(400, 'Validation failed', errors);
  }

  return payload;
};

export const validateUploadCertificate = (body) => {
  const errors = [];
  const { fileName, fileUrl } = body;

  if (!fileName?.trim()) {
    errors.push({ field: 'fileName', message: 'File name is required' });
  }

  if (!fileUrl?.trim()) {
    errors.push({ field: 'fileUrl', message: 'File URL is required' });
  }

  if (errors.length) {
    throw new ApiError(400, 'Validation failed', errors);
  }

  return {
    fileName: fileName.trim(),
    fileUrl: fileUrl.trim(),
  };
};

export const validateListOrders = (query) => {
  const errors = [];
  const filters = {};

  if (query.status !== undefined) {
    if (!ORDER_STATUS_VALUES.includes(query.status)) {
      errors.push({ field: 'status', message: 'Invalid status value' });
    } else {
      filters.status = query.status;
    }
  }

  if (query.customer !== undefined) {
    filters.customer = validateObjectId(query.customer, 'customer', errors);
  }

  if (errors.length) {
    throw new ApiError(400, 'Validation failed', errors);
  }

  return filters;
};
