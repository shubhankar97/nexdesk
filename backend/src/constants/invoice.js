export const INVOICE_DOCUMENT_TYPE = 'invoice';

export const PARSE_STATUS = {
  PENDING: 'pending',
  VALID: 'valid',
  PARTIAL: 'partial',
  INVALID: 'invalid',
  FAILED: 'failed',
};

/** Canonical invoice JSON shape produced by the rule-based parser. */
export const createEmptyInvoiceJson = () => ({
  documentType: INVOICE_DOCUMENT_TYPE,
  invoiceNumber: null,
  invoiceDate: null,
  dueDate: null,
  currency: null,
  vendor: {
    name: null,
    address: null,
    taxId: null,
    email: null,
    phone: null,
  },
  customer: {
    name: null,
    address: null,
    taxId: null,
  },
  lineItems: [],
  subtotal: null,
  taxAmount: null,
  taxRate: null,
  total: null,
  paymentTerms: null,
  notes: null,
});
