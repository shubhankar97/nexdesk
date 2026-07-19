import apiClient from '../api/client.js';
import { TENANT_HEADER } from '../constants/tenant.js';

const tenantHeaders = (tenantSubdomain) =>
  tenantSubdomain ? { [TENANT_HEADER]: tenantSubdomain } : {};

const triggerBrowserDownload = (blob, fileName) => {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};

const fileNameFromDisposition = (header, fallback) => {
  if (!header) {
    return fallback;
  }

  const match = header.match(/filename\*?=(?:UTF-8''|")?([^\";]+)/i);
  if (!match?.[1]) {
    return fallback;
  }

  try {
    return decodeURIComponent(match[1].replace(/"/g, ''));
  } catch {
    return match[1].replace(/"/g, '');
  }
};

const downloadExportResponse = async (response, fallbackName) => {
  const contentType = response.headers['content-type'] || '';

  if (contentType.includes('application/json')) {
    const text = await response.data.text();
    let message = 'Export failed.';
    try {
      message = JSON.parse(text)?.message || message;
    } catch {
      // keep default
    }
    const error = new Error(message);
    error.response = { data: { message } };
    throw error;
  }

  const fileName = fileNameFromDisposition(
    response.headers['content-disposition'],
    fallbackName
  );
  triggerBrowserDownload(response.data, fileName);
};

export const listDocuments = async ({ tenantSubdomain, ...filters } = {}) => {
  const params = {};

  if (filters.search) params.search = filters.search;
  if (filters.status) params.status = filters.status;
  if (filters.parseStatus) params.parseStatus = filters.parseStatus;
  if (filters.dateFrom) params.dateFrom = filters.dateFrom;
  if (filters.dateTo) params.dateTo = filters.dateTo;

  const { data } = await apiClient.get('/documents', {
    headers: tenantHeaders(tenantSubdomain),
    params,
  });
  return data.data;
};

export const getDocumentAiUsage = async ({ tenantSubdomain } = {}) => {
  const { data } = await apiClient.get('/documents/usage', {
    headers: tenantHeaders(tenantSubdomain),
  });
  return data.data;
};

export const uploadDocuments = async (files, { tenantSubdomain, onUploadProgress } = {}) => {
  const formData = new FormData();
  files.forEach((file) => {
    formData.append('files', file);
  });

  const { data } = await apiClient.post('/documents/upload', formData, {
    headers: tenantHeaders(tenantSubdomain),
    transformRequest: [
      (body, headers) => {
        if (body instanceof FormData) {
          delete headers['Content-Type'];
        }
        return body;
      },
    ],
    onUploadProgress,
  });

  return data.data;
};

export const uploadDocument = async (file, { tenantSubdomain, onUploadProgress } = {}) => {
  const result = await uploadDocuments([file], { tenantSubdomain, onUploadProgress });
  return result[0];
};

export const getDocument = async (id, { tenantSubdomain } = {}) => {
  const { data } = await apiClient.get(`/documents/${id}`, {
    headers: tenantHeaders(tenantSubdomain),
  });
  return data.data;
};

export const processDocumentOcr = async (id, { tenantSubdomain } = {}) => {
  const { data } = await apiClient.post(`/documents/${id}/ocr`, null, {
    headers: tenantHeaders(tenantSubdomain),
  });
  return data.data;
};

export const parseDocumentInvoice = async (id, { tenantSubdomain } = {}) => {
  const { data } = await apiClient.post(`/documents/${id}/parse`, null, {
    headers: tenantHeaders(tenantSubdomain),
  });
  return data.data;
};

const parseBlobError = async (error) => {
  const data = error?.response?.data;
  if (data instanceof Blob) {
    try {
      const text = await data.text();
      const json = JSON.parse(text);
      const err = new Error(json.message || 'Export failed.');
      err.response = { data: json };
      throw err;
    } catch (parseError) {
      if (parseError.response) {
        throw parseError;
      }
    }
  }
  throw error;
};

export const exportDocuments = async (
  format = 'csv',
  { tenantSubdomain, search, status, parseStatus, dateFrom, dateTo } = {}
) => {
  try {
    const response = await apiClient.get('/documents/export', {
      params: {
        format,
        ...(search ? { search } : {}),
        ...(status ? { status } : {}),
        ...(parseStatus ? { parseStatus } : {}),
        ...(dateFrom ? { dateFrom } : {}),
        ...(dateTo ? { dateTo } : {}),
      },
      headers: tenantHeaders(tenantSubdomain),
      responseType: 'blob',
    });

    await downloadExportResponse(response, `document-ai-invoices.${format}`);
  } catch (error) {
    await parseBlobError(error);
  }
};

export const exportDocument = async (id, format = 'csv', { tenantSubdomain } = {}) => {
  try {
    const response = await apiClient.get(`/documents/${id}/export`, {
      params: { format },
      headers: tenantHeaders(tenantSubdomain),
      responseType: 'blob',
    });

    await downloadExportResponse(response, `invoice.${format}`);
  } catch (error) {
    await parseBlobError(error);
  }
};

export const viewDocument = async (id, { tenantSubdomain } = {}) => {
  const response = await apiClient.get(`/documents/${id}/download`, {
    headers: tenantHeaders(tenantSubdomain),
    responseType: 'blob',
  });

  const url = window.URL.createObjectURL(response.data);
  const link = document.createElement('a');
  link.href = url;
  link.target = '_blank';
  link.rel = 'noopener noreferrer';
  document.body.appendChild(link);
  link.click();
  link.remove();

  // Keep the object URL alive long enough for the new tab to load it.
  window.setTimeout(() => window.URL.revokeObjectURL(url), 60_000);
};

export const deleteDocument = async (id, { tenantSubdomain } = {}) => {
  const { data } = await apiClient.delete(`/documents/${id}`, {
    headers: tenantHeaders(tenantSubdomain),
  });
  return data.data;
};
