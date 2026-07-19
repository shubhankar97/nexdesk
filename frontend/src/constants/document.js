export const DOCUMENT_ACCEPT =
  'application/pdf,image/jpeg,image/png,image/webp,image/gif,.pdf,.jpg,.jpeg,.png,.webp,.gif';

export const DOCUMENT_ALLOWED_MIME_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
];

export const DOCUMENT_MAX_FILE_SIZE = 10 * 1024 * 1024;

export const DOCUMENT_MAX_FILES = 10;

export const DOCUMENT_STATUS = {
  UPLOADED: 'uploaded',
  PROCESSING: 'processing',
  READY: 'ready',
  FAILED: 'failed',
};

export const isOcrPendingStatus = (status) =>
  status === DOCUMENT_STATUS.UPLOADED || status === DOCUMENT_STATUS.PROCESSING;

export const getDocumentStatusColor = (status) => {
  switch (status) {
    case DOCUMENT_STATUS.READY:
      return 'success';
    case DOCUMENT_STATUS.PROCESSING:
    case DOCUMENT_STATUS.UPLOADED:
      return 'warning';
    case DOCUMENT_STATUS.FAILED:
      return 'error';
    default:
      return 'default';
  }
};

export const isAllowedDocumentFile = (file) => {
  if (DOCUMENT_ALLOWED_MIME_TYPES.includes(file.type)) {
    return true;
  }

  const name = file.name?.toLowerCase() ?? '';
  return ['.pdf', '.jpg', '.jpeg', '.png', '.webp', '.gif'].some((ext) => name.endsWith(ext));
};

export const formatFileSize = (bytes) => {
  if (!bytes && bytes !== 0) {
    return '—';
  }

  if (bytes < 1024) {
    return `${bytes} B`;
  }

  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};
