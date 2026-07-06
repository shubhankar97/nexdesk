import { asyncHandler } from '../utils/asyncHandler.js';
import * as authService from '../services/auth.service.js';
import {
  validateForgotPassword,
  validateLogin,
  validateRefreshToken,
  validateResetPassword,
} from '../validators/auth.validator.js';

export const loginMaster = asyncHandler(async (req, res) => {
  const credentials = validateLogin(req.body);
  const result = await authService.loginMaster(credentials);

  res.status(200).json({
    success: true,
    data: result,
  });
});

export const loginAdmin = asyncHandler(async (req, res) => {
  const credentials = validateLogin(req.body);
  const result = await authService.loginAdmin(credentials);

  res.status(200).json({
    success: true,
    data: result,
  });
});

export const loginCustomer = asyncHandler(async (req, res) => {
  const credentials = validateLogin(req.body);
  const result = await authService.loginCustomer(credentials);

  res.status(200).json({
    success: true,
    data: result,
  });
});

export const refreshToken = asyncHandler(async (req, res) => {
  const { refreshToken: token } = validateRefreshToken(req.body);
  const result = await authService.refreshAccessToken(token);

  res.status(200).json({
    success: true,
    data: result,
  });
});

export const logout = asyncHandler(async (req, res) => {
  await authService.logout(req.user.sub, req.user.tenantId ?? null);

  res.status(200).json({
    success: true,
    message: 'Logged out successfully',
  });
});

export const getMe = asyncHandler(async (req, res) => {
  const user = await authService.getCurrentUser(req.user.sub, req.user.tenantId ?? null);

  res.status(200).json({
    success: true,
    data: user,
  });
});

export const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = validateForgotPassword(req.body);
  const result = await authService.requestPasswordReset(email);

  res.status(200).json({
    success: true,
    ...result,
  });
});

export const resetPassword = asyncHandler(async (req, res) => {
  const payload = validateResetPassword(req.body);
  const result = await authService.resetPassword(payload);

  res.status(200).json({
    success: true,
    ...result,
  });
});
