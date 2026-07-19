import { asyncHandler } from '../utils/asyncHandler.js';
import * as documentService from '../services/document.service.js';
import { validateDocumentId, validateDocumentHistoryQuery, validateExportQuery } from '../validators/document.validator.js';

const sendExportFile = (res, { buffer, mimeType, fileName }) => {
  res.setHeader('Content-Type', mimeType);
  res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(fileName)}"`);
  res.status(200).send(buffer);
};

export const listDocuments = asyncHandler(async (req, res) => {
  const filters = validateDocumentHistoryQuery(req.query);
  const data = await documentService.listDocuments(filters);

  res.status(200).json({
    success: true,
    data,
  });
});

export const getDocumentAiUsage = asyncHandler(async (_req, res) => {
  const data = await documentService.getDocumentAiUsage();

  res.status(200).json({
    success: true,
    data,
  });
});

export const getDocument = asyncHandler(async (req, res) => {
  const { id } = validateDocumentId(req.params);
  const data = await documentService.getDocumentById(id);

  res.status(200).json({
    success: true,
    data,
  });
});

export const uploadDocuments = asyncHandler(async (req, res) => {
  const files = req.files?.length ? req.files : req.file ? [req.file] : [];
  const data = await documentService.uploadDocuments(files, req.user);

  res.status(201).json({
    success: true,
    data,
  });
});

export const processDocumentOcr = asyncHandler(async (req, res) => {
  const { id } = validateDocumentId(req.params);
  const data = await documentService.processDocumentOcr(id);

  res.status(200).json({
    success: true,
    data,
  });
});

export const parseDocumentInvoice = asyncHandler(async (req, res) => {
  const { id } = validateDocumentId(req.params);
  const data = await documentService.parseDocumentInvoice(id);

  res.status(200).json({
    success: true,
    data,
  });
});

export const exportDocuments = asyncHandler(async (req, res) => {
  const { format, ...filters } = validateExportQuery(req.query);
  const file = await documentService.exportDocuments(format, filters);
  sendExportFile(res, file);
});

export const exportDocument = asyncHandler(async (req, res) => {
  const { id } = validateDocumentId(req.params);
  const { format } = validateExportQuery(req.query);
  const file = await documentService.exportDocumentById(id, format);
  sendExportFile(res, file);
});

export const downloadDocument = asyncHandler(async (req, res) => {
  const { id } = validateDocumentId(req.params);
  const { buffer, mimeType, originalName } = await documentService.getDocumentFile(id);

  res.setHeader('Content-Type', mimeType);
  res.setHeader(
    'Content-Disposition',
    `attachment; filename="${encodeURIComponent(originalName)}"`
  );
  res.status(200).send(buffer);
});

export const deleteDocument = asyncHandler(async (req, res) => {
  const { id } = validateDocumentId(req.params);
  const data = await documentService.deleteDocument(id);

  res.status(200).json({
    success: true,
    data,
  });
});
