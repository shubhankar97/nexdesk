import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { ApiError } from './ApiError.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const UPLOADS_ROOT = path.resolve(__dirname, '../../uploads');

const ensureDir = async (dirPath) => {
  await fs.mkdir(dirPath, { recursive: true });
};

export const getTenantUploadDir = (tenantId) => path.join(UPLOADS_ROOT, tenantId);

export const saveUploadedFile = async (tenantId, storedName, buffer) => {
  const tenantDir = getTenantUploadDir(tenantId);
  await ensureDir(tenantDir);

  const absolutePath = path.join(tenantDir, storedName);
  await fs.writeFile(absolutePath, buffer);

  return path.join(tenantId, storedName);
};

export const resolveStoragePath = (storagePath) => {
  const absolutePath = path.resolve(UPLOADS_ROOT, storagePath);
  const normalizedRoot = path.resolve(UPLOADS_ROOT);

  if (!absolutePath.startsWith(normalizedRoot + path.sep) && absolutePath !== normalizedRoot) {
    throw new ApiError(400, 'Invalid storage path');
  }

  return absolutePath;
};

export const readStoredFile = async (storagePath) => {
  const absolutePath = resolveStoragePath(storagePath);

  try {
    return await fs.readFile(absolutePath);
  } catch {
    throw new ApiError(404, 'File not found on disk');
  }
};

export const deleteStoredFile = async (storagePath) => {
  const absolutePath = resolveStoragePath(storagePath);

  try {
    await fs.unlink(absolutePath);
  } catch (error) {
    if (error.code !== 'ENOENT') {
      throw error;
    }
  }
};
