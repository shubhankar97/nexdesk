import ExcelJS from 'exceljs';
import {
  EXPORT_FORMAT,
  INVOICE_EXPORT_COLUMNS,
  LINE_ITEM_EXPORT_COLUMNS,
} from '../constants/export.js';

const cell = (value) => {
  if (value == null) {
    return '';
  }
  if (typeof value === 'number') {
    return value;
  }
  return String(value);
};

const escapeCsv = (value) => {
  const text = value == null ? '' : String(value);
  if (/[",\n\r]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`;
  }
  return text;
};

export const toInvoiceExportRow = (document) => {
  const invoice = document.parsedInvoice || {};
  const vendor = invoice.vendor || {};
  const customer = invoice.customer || {};
  const lineItems = Array.isArray(invoice.lineItems) ? invoice.lineItems : [];

  return {
    documentId: document.id || document._id?.toString() || '',
    fileName: document.originalName || '',
    parseStatus: document.parseStatus || '',
    invoiceNumber: invoice.invoiceNumber || '',
    invoiceDate: invoice.invoiceDate || '',
    dueDate: invoice.dueDate || '',
    currency: invoice.currency || '',
    vendorName: vendor.name || '',
    vendorTaxId: vendor.taxId || '',
    vendorEmail: vendor.email || '',
    vendorPhone: vendor.phone || '',
    vendorAddress: vendor.address || '',
    customerName: customer.name || '',
    customerTaxId: customer.taxId || '',
    customerAddress: customer.address || '',
    subtotal: invoice.subtotal ?? '',
    taxRate: invoice.taxRate ?? '',
    taxAmount: invoice.taxAmount ?? '',
    total: invoice.total ?? '',
    paymentTerms: invoice.paymentTerms || '',
    notes: invoice.notes || '',
    lineItemCount: lineItems.length,
    uploadedAt: document.createdAt ? new Date(document.createdAt).toISOString() : '',
  };
};

export const toLineItemExportRows = (document) => {
  const invoice = document.parsedInvoice || {};
  const lineItems = Array.isArray(invoice.lineItems) ? invoice.lineItems : [];
  const documentId = document.id || document._id?.toString() || '';

  return lineItems.map((item, index) => ({
    documentId,
    invoiceNumber: invoice.invoiceNumber || '',
    lineIndex: index + 1,
    description: item.description || '',
    quantity: item.quantity ?? '',
    unitPrice: item.unitPrice ?? '',
    amount: item.amount ?? '',
  }));
};

export const buildCsvBuffer = (documents) => {
  const rows = documents.map(toInvoiceExportRow);
  const header = INVOICE_EXPORT_COLUMNS.join(',');
  const body = rows
    .map((row) => INVOICE_EXPORT_COLUMNS.map((key) => escapeCsv(row[key])).join(','))
    .join('\n');

  const csv = `${header}\n${body}\n`;
  return Buffer.from(csv, 'utf8');
};

export const buildXlsxBuffer = async (documents) => {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'NexDesk Document AI';
  workbook.created = new Date();

  const invoiceSheet = workbook.addWorksheet('Invoices');
  invoiceSheet.columns = INVOICE_EXPORT_COLUMNS.map((key) => ({
    header: key,
    key,
    width: Math.min(28, Math.max(12, key.length + 2)),
  }));

  documents.map(toInvoiceExportRow).forEach((row) => {
    invoiceSheet.addRow(
      Object.fromEntries(INVOICE_EXPORT_COLUMNS.map((key) => [key, cell(row[key])]))
    );
  });
  invoiceSheet.getRow(1).font = { bold: true };

  const lineSheet = workbook.addWorksheet('LineItems');
  lineSheet.columns = LINE_ITEM_EXPORT_COLUMNS.map((key) => ({
    header: key,
    key,
    width: Math.min(28, Math.max(12, key.length + 2)),
  }));

  documents
    .flatMap((document) => toLineItemExportRows(document))
    .forEach((row) => {
      lineSheet.addRow(
        Object.fromEntries(LINE_ITEM_EXPORT_COLUMNS.map((key) => [key, cell(row[key])]))
      );
    });
  lineSheet.getRow(1).font = { bold: true };

  const arrayBuffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(arrayBuffer);
};

export const buildExportFile = async (documents, format) => {
  if (format === EXPORT_FORMAT.CSV) {
    return {
      buffer: buildCsvBuffer(documents),
      extension: 'csv',
    };
  }

  return {
    buffer: await buildXlsxBuffer(documents),
    extension: 'xlsx',
  };
};
