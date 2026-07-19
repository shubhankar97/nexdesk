import { PARSE_STATUS } from '../constants/invoice.js';

const isIsoDate = (value) =>
  typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(value));

const isMoney = (value) => value == null || (typeof value === 'number' && Number.isFinite(value));

const nearlyEqual = (a, b, tolerance = 1) => {
  if (a == null || b == null) {
    return true;
  }
  return Math.abs(a - b) <= tolerance;
};

/**
 * Validates canonical invoice JSON and returns parse status + errors.
 *
 * - valid: core fields present, no validation errors
 * - partial: some fields extracted but warnings/errors remain
 * - invalid: missing both invoiceNumber and total (or malformed root)
 */
export const validateInvoiceJson = (invoice) => {
  if (!invoice || typeof invoice !== 'object') {
    return {
      status: PARSE_STATUS.INVALID,
      errors: ['Invoice JSON is missing'],
      invoice: null,
    };
  }

  const errors = [];

  if (invoice.documentType !== 'invoice') {
    errors.push('documentType must be "invoice"');
  }

  const hasInvoiceNumber = Boolean(invoice.invoiceNumber);
  const hasTotal = invoice.total != null;

  if (!hasInvoiceNumber && !hasTotal) {
    errors.push('Either invoiceNumber or total is required');
  }

  if (invoice.invoiceDate && !isIsoDate(invoice.invoiceDate)) {
    errors.push('invoiceDate must be YYYY-MM-DD');
  }

  if (invoice.dueDate && !isIsoDate(invoice.dueDate)) {
    errors.push('dueDate must be YYYY-MM-DD');
  }

  for (const field of ['subtotal', 'taxAmount', 'taxRate', 'total']) {
    if (!isMoney(invoice[field])) {
      errors.push(`${field} must be a number`);
    }
  }

  if (!invoice.vendor || typeof invoice.vendor !== 'object') {
    errors.push('vendor must be an object');
  }

  if (!invoice.customer || typeof invoice.customer !== 'object') {
    errors.push('customer must be an object');
  }

  if (!Array.isArray(invoice.lineItems)) {
    errors.push('lineItems must be an array');
  } else {
    invoice.lineItems.forEach((item, index) => {
      if (!item || typeof item !== 'object') {
        errors.push(`lineItems[${index}] is invalid`);
        return;
      }
      if (!item.description) {
        errors.push(`lineItems[${index}].description is required`);
      }
      for (const field of ['quantity', 'unitPrice', 'amount']) {
        if (!isMoney(item[field])) {
          errors.push(`lineItems[${index}].${field} must be a number`);
        }
      }
    });
  }

  if (
    invoice.subtotal != null &&
    invoice.taxAmount != null &&
    invoice.total != null &&
    !nearlyEqual(invoice.subtotal + invoice.taxAmount, invoice.total)
  ) {
    errors.push('subtotal + taxAmount does not equal total');
  }

  if (Array.isArray(invoice.lineItems) && invoice.lineItems.length > 0 && invoice.subtotal != null) {
    const lineSum = invoice.lineItems.reduce((sum, item) => sum + (item.amount || 0), 0);
    if (!nearlyEqual(lineSum, invoice.subtotal, 2)) {
      errors.push('sum of lineItems.amount does not match subtotal');
    }
  }

  let status = PARSE_STATUS.VALID;

  if (!hasInvoiceNumber && !hasTotal) {
    status = PARSE_STATUS.INVALID;
  } else if (errors.length > 0) {
    status = PARSE_STATUS.PARTIAL;
  }

  return {
    status,
    errors,
    invoice,
  };
};
