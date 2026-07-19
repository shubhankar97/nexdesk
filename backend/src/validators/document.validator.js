import { ApiError } from '../utils/ApiError.js';
import { DOCUMENT_STATUS } from '../constants/document.js';
import { EXPORT_FORMAT } from '../constants/export.js';
import { PARSE_STATUS } from '../constants/invoice.js';

export const validateDocumentId = (input) => {
  const id = input?.id ?? input;

  if (!id || typeof id !== 'string') {
    throw new ApiError(400, 'Document ID is required');
  }

  return { id: id.trim() };
};

export const validateExportFormat = (query = {}) => {
  const format = String(query.format || EXPORT_FORMAT.CSV).toLowerCase().trim();

  if (![EXPORT_FORMAT.CSV, EXPORT_FORMAT.XLSX].includes(format)) {
    throw new ApiError(400, 'Export format must be csv or xlsx');
  }

  return { format };
};

const parseOptionalDate = (value, field) => {
  if (value == null || value === '') {
    return null;
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    throw new ApiError(400, `${field} must be a valid date`);
  }

  return date;
};

export const validateDocumentHistoryQuery = (query = {}) => {
  const search = typeof query.search === 'string' ? query.search.trim() : '';
  const status = typeof query.status === 'string' ? query.status.trim() : '';
  const parseStatus = typeof query.parseStatus === 'string' ? query.parseStatus.trim() : '';

  if (status && !Object.values(DOCUMENT_STATUS).includes(status)) {
    throw new ApiError(400, 'Invalid OCR status filter');
  }

  if (parseStatus && !Object.values(PARSE_STATUS).includes(parseStatus)) {
    throw new ApiError(400, 'Invalid parse status filter');
  }

  const dateFrom = parseOptionalDate(query.dateFrom, 'dateFrom');
  const dateTo = parseOptionalDate(query.dateTo, 'dateTo');

  if (dateFrom && dateTo && dateFrom > dateTo) {
    throw new ApiError(400, 'dateFrom must be before dateTo');
  }

  return {
    search: search || null,
    status: status || null,
    parseStatus: parseStatus || null,
    dateFrom,
    dateTo,
  };
};

export const validateExportQuery = (query = {}) => ({
  ...validateExportFormat(query),
  ...validateDocumentHistoryQuery(query),
});
