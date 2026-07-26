import path from 'path';
import {
  DOCUMENT_ALLOWED_EXTENSIONS,
  DOCUMENT_ALLOWED_MIME_TYPES,
  DOCUMENT_MAX_FILES,
  DOCUMENT_STATUS,
} from '../constants/document.js';
import { EXPORT_MIME } from '../constants/export.js';
import { PARSE_STATUS } from '../constants/invoice.js';
import { ROLES } from '../constants/roles.js';
import { getTenantContext, getTenant, getTenantId, runWithTenantContext } from '../context/tenantContext.js';
import { createStoredFileName } from '../models/schemas/document.schema.js';
import * as documentRepository from '../repositories/document.repository.js';
import { ApiError } from '../utils/ApiError.js';
import { buildExportFile } from '../utils/invoiceExport.js';
import { deleteStoredFile, readStoredFile } from '../utils/storage.js';
import { parseInvoiceText } from './invoiceParser.service.js';
import { validateInvoiceJson } from './invoiceValidator.service.js';
import * as ocrClient from './ocr.client.js';
import * as usageService from './usage.service.js';

const formatDocument = (document, options) => document.toSafeObject(getTenantId(), options);

const toExportDocument = (document) =>
  formatDocument(document, { includeText: false, includeParsed: true });

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const isMongoStoragePath = (storagePath) =>
  typeof storagePath === 'string' && storagePath.startsWith('mongo:');

const isDiskStoragePath = (storagePath) =>
  typeof storagePath === 'string' && storagePath.length > 0 && !isMongoStoragePath(storagePath);

const toBuffer = (fileData) => {
  if (!fileData) {
    return null;
  }

  if (Buffer.isBuffer(fileData)) {
    return fileData.length > 0 ? fileData : null;
  }

  if (fileData.buffer && typeof fileData.buffer === 'object') {
    const buf = Buffer.from(fileData.buffer);
    return buf.length > 0 ? buf : null;
  }

  try {
    const buf = Buffer.from(fileData);
    return buf.length > 0 ? buf : null;
  } catch {
    return null;
  }
};

/**
 * Prefer Mongo BinData; fall back to legacy disk files when present.
 */
const readDocumentFileBuffer = async (document) => {
  const fromMongo = toBuffer(document.fileData);
  if (fromMongo) {
    return fromMongo;
  }

  if (isDiskStoragePath(document.storagePath)) {
    return readStoredFile(document.storagePath);
  }

  throw new ApiError(404, 'File data not found in database');
};

const buildHistoryFilter = (filters = {}) => {
  const query = {};

  if (filters.status) {
    query.status = filters.status;
  }

  if (filters.parseStatus) {
    query.parseStatus = filters.parseStatus;
  }

  if (filters.dateFrom || filters.dateTo) {
    query.createdAt = {};
    if (filters.dateFrom) {
      query.createdAt.$gte = filters.dateFrom;
    }
    if (filters.dateTo) {
      const end = new Date(filters.dateTo);
      end.setHours(23, 59, 59, 999);
      query.createdAt.$lte = end;
    }
  }

  if (filters.search) {
    const pattern = new RegExp(escapeRegex(filters.search), 'i');
    query.$or = [
      { originalName: pattern },
      { 'parsedInvoice.invoiceNumber': pattern },
      { 'parsedInvoice.vendor.name': pattern },
      { 'parsedInvoice.customer.name': pattern },
    ];
  }

  return query;
};

const assertAllowedFile = (file) => {
  const extension = path.extname(file.originalname || '').toLowerCase();

  if (!DOCUMENT_ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    throw new ApiError(400, 'Only PDF and image files (JPEG, PNG, WebP, GIF) are allowed');
  }

  if (extension && !DOCUMENT_ALLOWED_EXTENSIONS.includes(extension)) {
    throw new ApiError(400, 'File extension must be PDF or an image type');
  }
};

const applyInvoiceParse = async (id, extractedText) => {
  try {
    const parsed = parseInvoiceText(extractedText);
    const validation = validateInvoiceJson(parsed);

    return documentRepository.updateDocumentById(id, {
      parsedInvoice: validation.invoice,
      parseStatus: validation.status,
      parseErrors: validation.errors,
      parsedAt: new Date(),
    });
  } catch (error) {
    return documentRepository.updateDocumentById(id, {
      parsedInvoice: null,
      parseStatus: PARSE_STATUS.FAILED,
      parseErrors: [error.message || 'Invoice parsing failed'],
      parsedAt: new Date(),
    });
  }
};

const scheduleOcr = (documentId) => {
  const context = getTenantContext();

  if (!context) {
    return;
  }

  setImmediate(() => {
    runWithTenantContext(context, () => {
      void (async () => {
        try {
          await processDocumentOcr(documentId);
        } catch (error) {
          console.error(`OCR job failed for document ${documentId}:`, error.message);
        }
      })();
    });
  });
};

export const listDocuments = async (filters = {}) => {
  const documents = await documentRepository.findDocuments(buildHistoryFilter(filters));
  return documents.map((document) =>
    formatDocument(document, { includeText: false, includeParsed: false })
  );
};

export const getDocumentById = async (id) => {
  const document = await documentRepository.findDocumentById(id);

  if (!document) {
    throw new ApiError(404, 'Document not found');
  }

  return formatDocument(document, { includeText: true, includeParsed: true });
};

export const uploadDocuments = async (files, user) => {
  if (!files?.length) {
    throw new ApiError(400, 'At least one file is required');
  }

  if (files.length > DOCUMENT_MAX_FILES) {
    throw new ApiError(400, `You can upload up to ${DOCUMENT_MAX_FILES} files at once`);
  }

  const tenantId = getTenantId();
  const tenant = getTenant();

  if (!tenantId || !tenant) {
    throw new ApiError(400, 'Tenant context required');
  }

  await (user?.role === ROLES.MASTER
    ? Promise.resolve()
    : usageService.assertDocumentAiUploadAllowed(tenant, files.length));

  const uploadedBy = user?.sub || user?.id || user?.userId || 'unknown';
  const created = [];

  for (const file of files) {
    assertAllowedFile(file);

    const storedName = createStoredFileName(file.originalname);
    const fileBuffer = Buffer.isBuffer(file.buffer) ? file.buffer : Buffer.from(file.buffer || []);

    if (!fileBuffer.length) {
      throw new ApiError(400, 'Uploaded file is empty');
    }

    const document = await documentRepository.createDocument({
      originalName: file.originalname,
      storedName,
      mimeType: file.mimetype,
      size: file.size || fileBuffer.length,
      storagePath: `mongo:${storedName}`,
      fileData: fileBuffer,
      status: DOCUMENT_STATUS.UPLOADED,
      uploadedBy: String(uploadedBy),
      parseStatus: PARSE_STATUS.PENDING,
      parseErrors: [],
      parsedInvoice: null,
    });

    scheduleOcr(document._id.toString());
    created.push(formatDocument(document, { includeText: false, includeParsed: false }));
  }

  await usageService.incrementDocumentAiUploads(tenantId, files.length);

  return created;
};

export const getDocumentAiUsage = async () => {
  const tenant = getTenant();

  if (!tenant) {
    throw new ApiError(400, 'Tenant context required');
  }

  return usageService.getDocumentAiUsageSummary(tenant);
};

export const processDocumentOcr = async (id) => {
  const document = await documentRepository.findDocumentByIdWithFile(id);

  if (!document) {
    throw new ApiError(404, 'Document not found');
  }

  await documentRepository.updateDocumentById(id, {
    status: DOCUMENT_STATUS.PROCESSING,
    ocrError: null,
    parseStatus: PARSE_STATUS.PENDING,
    parseErrors: [],
    parsedInvoice: null,
  });

  try {
    const buffer = await readDocumentFileBuffer(document);
    const result = await ocrClient.runOcrOnFile({
      buffer,
      filename: document.originalName,
      mimeType: document.mimeType,
      preprocess: true,
    });

    await documentRepository.updateDocumentById(id, {
      status: DOCUMENT_STATUS.READY,
      extractedText: result.extractedText,
      ocrError: null,
      ocrEngine: result.engine,
      ocrSource: result.source,
      ocrConfidence: result.confidence,
      ocrPreprocessed: result.preprocessed,
      pageCount: result.pageCount,
      ocrProcessedAt: new Date(),
    });

    const updated = await applyInvoiceParse(id, result.extractedText);
    return formatDocument(updated, { includeText: true, includeParsed: true });
  } catch (error) {
    const message = error?.message || 'OCR processing failed';
    await documentRepository.updateDocumentById(id, {
      status: DOCUMENT_STATUS.FAILED,
      ocrError: message,
      ocrProcessedAt: new Date(),
      parseStatus: PARSE_STATUS.FAILED,
      parseErrors: ['OCR failed before parsing'],
    });

    if (error instanceof ApiError) {
      throw error;
    }

    throw new ApiError(502, message);
  }
};

export const parseDocumentInvoice = async (id) => {
  const document = await documentRepository.findDocumentById(id);

  if (!document) {
    throw new ApiError(404, 'Document not found');
  }

  if (!document.extractedText?.trim()) {
    throw new ApiError(400, 'No extracted text available. Run OCR first.');
  }

  const updated = await applyInvoiceParse(id, document.extractedText);
  return formatDocument(updated, { includeText: true, includeParsed: true });
};

export const exportDocuments = async (format, filters = {}) => {
  const mongoFilter = {
    ...buildHistoryFilter(filters),
    parsedInvoice: { $ne: null },
  };

  const documents = await documentRepository.findDocuments(mongoFilter);

  if (!documents.length) {
    throw new ApiError(404, 'No parsed invoices available to export');
  }

  const exportDocs = documents.map(toExportDocument);
  const { buffer, extension } = await buildExportFile(exportDocs, format);
  const stamp = new Date().toISOString().slice(0, 10);

  return {
    buffer,
    mimeType: EXPORT_MIME[format],
    fileName: `document-ai-invoices-${stamp}.${extension}`,
  };
};

export const exportDocumentById = async (id, format) => {
  const document = await documentRepository.findDocumentById(id);

  if (!document) {
    throw new ApiError(404, 'Document not found');
  }

  if (!document.parsedInvoice) {
    throw new ApiError(400, 'No parsed invoice available. Run parse first.');
  }

  const exportDocs = [toExportDocument(document)];
  const { buffer, extension } = await buildExportFile(exportDocs, format);
  const safeName = (document.originalName || 'invoice')
    .replace(/\.[^.]+$/, '')
    .replace(/[^\w.-]+/g, '_');

  return {
    buffer,
    mimeType: EXPORT_MIME[format],
    fileName: `${safeName}-invoice.${extension}`,
  };
};

export const getDocumentFile = async (id) => {
  const document = await documentRepository.findDocumentByIdWithFile(id);

  if (!document) {
    throw new ApiError(404, 'Document not found');
  }

  const buffer = await readDocumentFileBuffer(document);

  return {
    document: formatDocument(document, { includeText: false, includeParsed: false }),
    buffer,
    mimeType: document.mimeType,
    originalName: document.originalName,
  };
};

export const deleteDocument = async (id) => {
  const document = await documentRepository.findDocumentByIdWithFile(id);

  if (!document) {
    throw new ApiError(404, 'Document not found');
  }

  if (isDiskStoragePath(document.storagePath)) {
    await deleteStoredFile(document.storagePath);
  }

  await documentRepository.deleteDocumentById(id);

  return { id };
};
