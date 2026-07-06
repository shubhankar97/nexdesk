import { ApiError } from '../utils/ApiError.js';

export const validateAdminParams = (params) => {
  const tenantId = params?.tenantId?.trim();
  const adminId = params?.adminId?.trim();

  if (!tenantId) {
    throw new ApiError(400, 'Tenant ID is required');
  }

  if (!adminId) {
    throw new ApiError(400, 'Admin ID is required');
  }

  return { tenantId, adminId };
};

export const validateCreateAdmin = (body) => {
  const { tenantId, email, password, isActive } = body ?? {};

  if (!tenantId || typeof tenantId !== 'string') {
    throw new ApiError(400, 'Tenant is required');
  }

  if (!email?.trim()) {
    throw new ApiError(400, 'Email is required');
  }

  if (!password || typeof password !== 'string' || password.length < 8) {
    throw new ApiError(400, 'Password must be at least 8 characters');
  }

  return {
    tenantId: tenantId.trim(),
    email: email.trim().toLowerCase(),
    password,
    isActive: isActive !== false,
  };
};

export const validateUpdateAdmin = (body) => {
  const { email, password, isActive } = body ?? {};
  const payload = {};

  if (email !== undefined) {
    if (!email?.trim()) {
      throw new ApiError(400, 'Email cannot be empty');
    }

    payload.email = email.trim().toLowerCase();
  }

  if (password !== undefined) {
    if (!password || password.length < 8) {
      throw new ApiError(400, 'Password must be at least 8 characters');
    }

    payload.password = password;
  }

  if (isActive !== undefined) {
    payload.isActive = Boolean(isActive);
  }

  if (!Object.keys(payload).length) {
    throw new ApiError(400, 'No valid fields to update');
  }

  return payload;
};
