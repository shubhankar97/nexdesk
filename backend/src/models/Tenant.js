import crypto from 'crypto';
import mongoose from 'mongoose';

const tenantSchema = new mongoose.Schema(
  {
    tenantId: {
      type: String,
      required: true,
      unique: true,
      default: () => crypto.randomUUID(),
    },
    companyName: {
      type: String,
      required: true,
      trim: true,
    },
    subdomain: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

tenantSchema.methods.toSafeObject = function toSafeObject() {
  return {
    tenantId: this.tenantId,
    companyName: this.companyName,
    subdomain: this.subdomain,
    isActive: this.isActive,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
  };
};

export const Tenant = mongoose.model('Tenant', tenantSchema);
