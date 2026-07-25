import { ApiError } from '../utils/ApiError.js';

export const validateCustomerId = (params) => {
  const customerId = params?.id?.trim();

  if (!customerId) {
    throw new ApiError(400, 'Customer ID is required');
  }

  return customerId;
};

export const validateCreateCustomer = (body) => {
  const { email, password, isActive } = body ?? {};

  if (!email?.trim()) {
    throw new ApiError(400, 'Email is required');
  }

  if (!password || typeof password !== 'string' || password.length < 8) {
    throw new ApiError(400, 'Password must be at least 8 characters');
  }

  return {
    email: email.trim().toLowerCase(),
    password,
    isActive: isActive !== false,
  };
};

export const validateUpdateCustomer = (body) => {
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
