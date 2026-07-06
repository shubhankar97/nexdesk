import { ROLES } from '../constants/roles.js';
import { getPlatformModels } from '../config/database.js';
import { getTenantId, getTenantModels } from '../context/tenantContext.js';
import { getTenantModelsForTenant } from '../database/tenantConnection.js';
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

const buildTokenPayload = (user, tenantId = null) => ({
  sub: user._id.toString(),
  email: user.email,
  role: user.role,
  tenantId,
});

const issueTokens = async (user, tenantId = null) => {
  const payload = buildTokenPayload(user, tenantId);
  const accessToken = signAccessToken(payload);
  const refreshToken = signRefreshToken(payload);

  user.refreshToken = hashToken(refreshToken);
  await user.save({ validateBeforeSave: false });

  return {
    accessToken,
    refreshToken,
    user: user.toSafeObject(tenantId),
  };
};

const findMasterByCredentials = async (email, password) => {
  const { MasterUser } = getPlatformModels();
  const user = await MasterUser.findOne({ email: email.toLowerCase() }).select('+password');

  if (!user) {
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

const findTenantUserByCredentials = async (email, password, expectedRole) => {
  const models = getTenantModels();
  const tenantId = getTenantId();

  if (!models || !tenantId) {
    throw new ApiError(400, 'Tenant context required');
  }

  const user = await models.User.findOne({ email: email.toLowerCase() }).select('+password');

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

const resolveUserContext = async (userId, tenantId) => {
  if (!tenantId) {
    const { MasterUser } = getPlatformModels();
    return {
      userModel: MasterUser,
      tenantId: null,
    };
  }

  const { Tenant } = getPlatformModels();
  const tenant = await Tenant.findOne({ tenantId });

  if (!tenant) {
    throw new ApiError(401, 'Invalid or expired token');
  }

  const { models } = await getTenantModelsForTenant(tenant);

  return {
    userModel: models.User,
    tenantId: tenant.tenantId,
  };
};

export const loginMaster = async ({ email, password }) => {
  const user = await findMasterByCredentials(email, password);
  return issueTokens(user);
};

export const loginAdmin = async ({ email, password }) => {
  const user = await findTenantUserByCredentials(email, password, ROLES.ADMIN);
  return issueTokens(user, getTenantId());
};

export const loginCustomer = async ({ email, password }) => {
  const user = await findTenantUserByCredentials(email, password, ROLES.CUSTOMER);
  return issueTokens(user, getTenantId());
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

  const { userModel, tenantId } = await resolveUserContext(decoded.sub, decoded.tenantId);
  const user = await userModel.findById(decoded.sub).select('+refreshToken');

  if (!user || !user.isActive) {
    throw new ApiError(401, 'Invalid or expired refresh token');
  }

  if (user.refreshToken !== hashToken(refreshToken)) {
    throw new ApiError(401, 'Invalid or expired refresh token');
  }

  return issueTokens(user, tenantId);
};

export const logout = async (userId, tenantId = null) => {
  const { userModel } = await resolveUserContext(userId, tenantId);
  await userModel.findByIdAndUpdate(userId, { refreshToken: null });
};

export const getCurrentUser = async (userId, tenantId = null) => {
  const { userModel, tenantId: resolvedTenantId } = await resolveUserContext(userId, tenantId);
  const user = await userModel.findById(userId);

  if (!user || !user.isActive) {
    throw new ApiError(401, 'User not found');
  }

  return user.toSafeObject(resolvedTenantId);
};

export const requestPasswordReset = async (email) => {
  const models = getTenantModels();
  const tenantId = getTenantId();

  if (!models || !tenantId) {
    throw new ApiError(400, 'Tenant context required');
  }

  const user = await models.User.findOne({ email: email.toLowerCase() }).select(
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
  const models = getTenantModels();
  const tenantId = getTenantId();

  if (!models || !tenantId) {
    throw new ApiError(400, 'Tenant context required');
  }

  const hashedToken = hashToken(token);

  const user = await models.User.findOne({
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
