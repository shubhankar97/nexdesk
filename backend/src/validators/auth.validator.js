import { ApiError } from '../utils/ApiError.js';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const validateLogin = (body) => {
  const errors = [];
  const { email, password } = body;

  if (!email?.trim()) {
    errors.push({ field: 'email', message: 'Email is required' });
  } else if (!EMAIL_REGEX.test(email.trim())) {
    errors.push({ field: 'email', message: 'Invalid email format' });
  }

  if (!password) {
    errors.push({ field: 'password', message: 'Password is required' });
  }

  if (errors.length) {
    throw new ApiError(400, 'Validation failed', errors);
  }

  return {
    email: email.trim().toLowerCase(),
    password,
  };
};

export const validateForgotPassword = (body) => {
  const errors = [];
  const { email } = body;

  if (!email?.trim()) {
    errors.push({ field: 'email', message: 'Email is required' });
  } else if (!EMAIL_REGEX.test(email.trim())) {
    errors.push({ field: 'email', message: 'Invalid email format' });
  }

  if (errors.length) {
    throw new ApiError(400, 'Validation failed', errors);
  }

  return { email: email.trim().toLowerCase() };
};

export const validateResetPassword = (body) => {
  const errors = [];
  const { token, password, confirmPassword } = body;

  if (!token?.trim()) {
    errors.push({ field: 'token', message: 'Reset token is required' });
  }

  if (!password) {
    errors.push({ field: 'password', message: 'Password is required' });
  } else if (password.length < 8) {
    errors.push({ field: 'password', message: 'Password must be at least 8 characters' });
  }

  if (password !== confirmPassword) {
    errors.push({ field: 'confirmPassword', message: 'Passwords do not match' });
  }

  if (errors.length) {
    throw new ApiError(400, 'Validation failed', errors);
  }

  return {
    token: token.trim(),
    password,
  };
};

export const validateRefreshToken = (body) => {
  const { refreshToken } = body;

  if (!refreshToken?.trim()) {
    throw new ApiError(400, 'Refresh token is required');
  }

  return { refreshToken: refreshToken.trim() };
};
