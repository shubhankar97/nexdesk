export const DOCUMENT_MIME_TYPES = {
  'application/pdf': 'pdf',
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
};

export const DOCUMENT_ALLOWED_MIME_TYPES = Object.keys(DOCUMENT_MIME_TYPES);

export const DOCUMENT_ALLOWED_EXTENSIONS = ['.pdf', '.jpg', '.jpeg', '.png', '.webp', '.gif'];

export const DOCUMENT_MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

export const DOCUMENT_MAX_FILES = 10;

export const DOCUMENT_STATUS = {
  UPLOADED: 'uploaded',
  PROCESSING: 'processing',
  READY: 'ready',
  FAILED: 'failed',
};
