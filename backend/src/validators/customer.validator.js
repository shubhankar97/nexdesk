import { ApiError } from '../utils/ApiError.js';

export const validateCustomerId = (params) => {
  const customerId = params?.id?.trim();

  if (!customerId) {
    throw new ApiError(400, 'Customer ID is required');
  }

  return customerId;
};

export const validateMasterCustomerParams = (params) => {
  const tenantId = params?.tenantId?.trim();
  const customerId = params?.customerId?.trim();

  if (!tenantId) {
    throw new ApiError(400, 'Tenant ID is required');
  }

  if (!customerId) {
    throw new ApiError(400, 'Customer ID is required');
  }

  return { tenantId, customerId };
};

export const validateCreateCustomer = (body) => {
  const { name, email, mobile } = body ?? {};

  if (!name?.trim()) {
    throw new ApiError(400, 'Name is required');
  }

  if (!email?.trim()) {
    throw new ApiError(400, 'Email is required');
  }

  if (!mobile?.trim()) {
    throw new ApiError(400, 'Mobile is required');
  }

  return {
    name: name.trim(),
    email: email.trim().toLowerCase(),
    mobile: mobile.trim(),
  };
};

export const validateUpdateCustomer = (body) => {
  const { name, email, mobile } = body ?? {};
  const payload = {};

  if (name !== undefined) {
    if (!name?.trim()) {
      throw new ApiError(400, 'Name cannot be empty');
    }

    payload.name = name.trim();
  }

  if (email !== undefined) {
    if (!email?.trim()) {
      throw new ApiError(400, 'Email cannot be empty');
    }

    payload.email = email.trim().toLowerCase();
  }

  if (mobile !== undefined) {
    if (!mobile?.trim()) {
      throw new ApiError(400, 'Mobile cannot be empty');
    }

    payload.mobile = mobile.trim();
  }

  if (!Object.keys(payload).length) {
    throw new ApiError(400, 'No valid fields to update');
  }

  return payload;
};

export const validateMasterUpdateCustomer = (body) => {
  const { name, email, mobile, password, isActive } = body ?? {};
  const payload = {};

  if (name !== undefined) {
    if (!name?.trim()) {
      throw new ApiError(400, 'Name cannot be empty');
    }

    payload.name = name.trim();
  }

  if (email !== undefined) {
    if (!email?.trim()) {
      throw new ApiError(400, 'Email cannot be empty');
    }

    payload.email = email.trim().toLowerCase();
  }

  if (mobile !== undefined) {
    if (!mobile?.trim()) {
      throw new ApiError(400, 'Mobile cannot be empty');
    }

    payload.mobile = mobile.trim();
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

  if (payload.isActive === true && !payload.password) {
    throw new ApiError(400, 'Password is required to activate a customer');
  }

  if (!Object.keys(payload).length) {
    throw new ApiError(400, 'No valid fields to update');
  }

  return payload;
};
