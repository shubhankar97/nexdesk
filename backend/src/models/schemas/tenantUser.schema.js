import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import { ROLES } from '../../constants/roles.js';

const TENANT_ROLES = [ROLES.ADMIN, ROLES.CUSTOMER];

export const tenantUserSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      select: false,
    },
    role: {
      type: String,
      enum: TENANT_ROLES,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    refreshToken: {
      type: String,
      select: false,
    },
    passwordResetToken: {
      type: String,
      select: false,
    },
    passwordResetExpires: {
      type: Date,
      select: false,
    },
  },
  { timestamps: true }
);

tenantUserSchema.pre('save', async function hashPassword(next) {
  if (!this.isModified('password')) {
    return next();
  }

  this.password = await bcrypt.hash(this.password, 12);
  next();
});

tenantUserSchema.methods.comparePassword = function comparePassword(candidate) {
  return bcrypt.compare(candidate, this.password);
};

tenantUserSchema.methods.toSafeObject = function toSafeObject(tenantId = null) {
  return {
    id: this._id,
    email: this.email,
    role: this.role,
    tenantId,
    isActive: this.isActive,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
  };
};
