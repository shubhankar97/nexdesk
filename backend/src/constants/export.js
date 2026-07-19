export const EXPORT_FORMAT = {
  CSV: 'csv',
  XLSX: 'xlsx',
};

export const EXPORT_MIME = {
  [EXPORT_FORMAT.CSV]: 'text/csv; charset=utf-8',
  [EXPORT_FORMAT.XLSX]:
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
};

export const INVOICE_EXPORT_COLUMNS = [
  'documentId',
  'fileName',
  'parseStatus',
  'invoiceNumber',
  'invoiceDate',
  'dueDate',
  'currency',
  'vendorName',
  'vendorTaxId',
  'vendorEmail',
  'vendorPhone',
  'vendorAddress',
  'customerName',
  'customerTaxId',
  'customerAddress',
  'subtotal',
  'taxRate',
  'taxAmount',
  'total',
  'paymentTerms',
  'notes',
  'lineItemCount',
  'uploadedAt',
];

export const LINE_ITEM_EXPORT_COLUMNS = [
  'documentId',
  'invoiceNumber',
  'lineIndex',
  'description',
  'quantity',
  'unitPrice',
  'amount',
];
