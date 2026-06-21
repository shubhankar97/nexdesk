import { ROLES } from '../constants/roles.js';
import { User } from '../models/User.js';
import { ApiError } from '../utils/ApiError.js';
import { generateSecureToken, hashToken } from '../utils/crypto.js';
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from '../utils/jwt.js';
import { env } from '../config/env.js';
import { sendPasswordResetEmail } from './email.service.js';

const RESET_ALLOWED_ROLES = [ROLES.ADMIN, ROLES.CUSTOMER];

const buildTokenPayload = (user) => ({
  sub: user._id.toString(),
  email: user.email,
  role: user.role,
  tenantId: user.tenantId ?? null,
});

const issueTokens = async (user) => {
  const payload = buildTokenPayload(user);
  const accessToken = signAccessToken(payload);
  const refreshToken = signRefreshToken(payload);

  user.refreshToken = hashToken(refreshToken);
  await user.save({ validateBeforeSave: false });

  return {
    accessToken,
    refreshToken,
    user: user.toSafeObject(),
  };
};

const findUserByCredentials = async (email, password, expectedRole) => {
  const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

  if (!user || user.role !== expectedRole) {
    throw new ApiError(401, 'Invalid email or password');
  }

  if (!user.isActive) {
    throw new ApiError(403, 'Account is deactivated');
  }

  const isPasswordValid = await user.comparePassword(password);

  if (!isPasswordValid) {
    throw new ApiError(401, 'Invalid email or password');
  }

  return user;
};

export const loginMaster = async ({ email, password }) => {
  const user = await findUserByCredentials(email, password, ROLES.MASTER);
  return issueTokens(user);
};

export const loginAdmin = async ({ email, password }) => {
  const user = await findUserByCredentials(email, password, ROLES.ADMIN);
  return issueTokens(user);
};

export const loginCustomer = async ({ email, password }) => {
  const user = await findUserByCredentials(email, password, ROLES.CUSTOMER);
  return issueTokens(user);
};

export const refreshAccessToken = async (refreshToken) => {
  if (!refreshToken) {
    throw new ApiError(401, 'Refresh token is required');
  }

  let decoded;

  try {
    decoded = verifyRefreshToken(refreshToken);
  } catch {
    throw new ApiError(401, 'Invalid or expired refresh token');
  }

  const user = await User.findById(decoded.sub).select('+refreshToken');

  if (!user || !user.isActive) {
    throw new ApiError(401, 'Invalid or expired refresh token');
  }

  if (user.refreshToken !== hashToken(refreshToken)) {
    throw new ApiError(401, 'Invalid or expired refresh token');
  }

  return issueTokens(user);
};

export const logout = async (userId) => {
  await User.findByIdAndUpdate(userId, { refreshToken: null });
};

export const getCurrentUser = async (userId) => {
  const user = await User.findById(userId);

  if (!user || !user.isActive) {
    throw new ApiError(401, 'User not found');
  }

  return user.toSafeObject();
};

export const requestPasswordReset = async (email) => {
  const user = await User.findOne({ email: email.toLowerCase() }).select(
    '+passwordResetToken +passwordResetExpires'
  );

  if (!user || !RESET_ALLOWED_ROLES.includes(user.role)) {
    return { message: 'If an account exists, a reset link has been sent.' };
  }

  if (!user.isActive) {
    return { message: 'If an account exists, a reset link has been sent.' };
  }

  const resetToken = generateSecureToken();
  user.passwordResetToken = hashToken(resetToken);
  user.passwordResetExpires = new Date(Date.now() + env.passwordResetExpiresIn);
  await user.save({ validateBeforeSave: false });

  const resetUrl = `${env.frontendUrl}/reset-password?token=${resetToken}`;

  await sendPasswordResetEmail({ email: user.email, resetUrl });

  return { message: 'If an account exists, a reset link has been sent.' };
};

export const resetPassword = async ({ token, password }) => {
  const hashedToken = hashToken(token);

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  }).select('+password +passwordResetToken +passwordResetExpires +refreshToken');

  if (!user) {
    throw new ApiError(400, 'Invalid or expired reset token');
  }

  if (!RESET_ALLOWED_ROLES.includes(user.role)) {
    throw new ApiError(403, 'Password reset is not allowed for this account');
  }

  user.password = password;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  user.refreshToken = undefined;
  await user.save();

  return { message: 'Password reset successful' };
};
