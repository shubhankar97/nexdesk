import crypto from 'crypto';
import mongoose from 'mongoose';
import { DOCUMENT_STATUS } from '../../constants/document.js';
import { PARSE_STATUS } from '../../constants/invoice.js';

export const documentSchema = new mongoose.Schema(
  {
    originalName: {
      type: String,
      required: true,
      trim: true,
    },
    storedName: {
      type: String,
      required: true,
      trim: true,
    },
    mimeType: {
      type: String,
      required: true,
      trim: true,
    },
    size: {
      type: Number,
      required: true,
      min: 0,
    },
    storagePath: {
      type: String,
      required: false,
      trim: true,
      default: null,
    },
    // Binary file content (BinData). Excluded from queries by default.
    fileData: {
      type: Buffer,
      select: false,
      default: undefined,
    },
    status: {
      type: String,
      enum: Object.values(DOCUMENT_STATUS),
      default: DOCUMENT_STATUS.UPLOADED,
    },
    uploadedBy: {
      type: String,
      required: true,
      trim: true,
    },
    extractedText: {
      type: String,
      default: '',
    },
    ocrError: {
      type: String,
      default: null,
    },
    ocrEngine: {
      type: String,
      default: null,
    },
    ocrSource: {
      type: String,
      default: null,
    },
    ocrConfidence: {
      type: Number,
      default: null,
      min: 0,
      max: 1,
    },
    ocrPreprocessed: {
      type: Boolean,
      default: false,
    },
    pageCount: {
      type: Number,
      default: null,
      min: 0,
    },
    ocrProcessedAt: {
      type: Date,
      default: null,
    },
    parsedInvoice: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    parseStatus: {
      type: String,
      enum: Object.values(PARSE_STATUS),
      default: PARSE_STATUS.PENDING,
    },
    parseErrors: {
      type: [String],
      default: [],
    },
    parsedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

documentSchema.index({ createdAt: -1 });
documentSchema.index({ uploadedBy: 1 });
documentSchema.index({ status: 1 });
documentSchema.index({ parseStatus: 1 });

documentSchema.methods.toSafeObject = function toSafeObject(
  tenantId = null,
  { includeText = true, includeParsed = true } = {}
) {
  const invoice = this.parsedInvoice || null;

  return {
    id: this._id,
    originalName: this.originalName,
    mimeType: this.mimeType,
    size: this.size,
    status: this.status,
    uploadedBy: this.uploadedBy,
    ...(includeText ? { extractedText: this.extractedText || '' } : {}),
    ocrError: this.ocrError,
    ocrEngine: this.ocrEngine,
    ocrSource: this.ocrSource,
    ocrConfidence: this.ocrConfidence,
    ocrPreprocessed: this.ocrPreprocessed,
    pageCount: this.pageCount,
    ocrProcessedAt: this.ocrProcessedAt,
    parseStatus: this.parseStatus,
    parseErrors: this.parseErrors || [],
    parsedAt: this.parsedAt,
    invoiceNumber: invoice?.invoiceNumber || null,
    vendorName: invoice?.vendor?.name || null,
    customerName: invoice?.customer?.name || null,
    invoiceTotal: invoice?.total ?? null,
    invoiceCurrency: invoice?.currency || null,
    ...(includeParsed ? { parsedInvoice: this.parsedInvoice } : {}),
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
    ...(tenantId ? { tenantId } : {}),
  };
};

export const createStoredFileName = (originalName) => {
  const extension = originalName.includes('.')
    ? originalName.slice(originalName.lastIndexOf('.')).toLowerCase()
    : '';
  return `${crypto.randomUUID()}${extension}`;
};
