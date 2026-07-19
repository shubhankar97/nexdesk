import multer from 'multer';
import {
  DOCUMENT_ALLOWED_MIME_TYPES,
  DOCUMENT_MAX_FILE_SIZE,
  DOCUMENT_MAX_FILES,
} from '../constants/document.js';
import { ApiError } from '../utils/ApiError.js';

const storage = multer.memoryStorage();

const fileFilter = (_req, file, cb) => {
  if (!DOCUMENT_ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    cb(new ApiError(400, 'Only PDF and image files (JPEG, PNG, WebP, GIF) are allowed'));
    return;
  }

  cb(null, true);
};

export const documentUpload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: DOCUMENT_MAX_FILE_SIZE,
    files: DOCUMENT_MAX_FILES,
  },
});

export const handleUploadErrors = (error, _req, _res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return next(new ApiError(400, 'Each file must be 10 MB or smaller'));
    }

    if (error.code === 'LIMIT_FILE_COUNT') {
      return next(new ApiError(400, `You can upload up to ${DOCUMENT_MAX_FILES} files at once`));
    }

    return next(new ApiError(400, error.message));
  }

  return next(error);
};
