import crypto from 'crypto';
import mongoose from 'mongoose';
import { SUBSCRIPTION_STATUS } from '../constants/subscription.js';

export const tenantSchema = new mongoose.Schema(
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
    planId: {
      type: String,
      default: null,
    },
    subscriptionStatus: {
      type: String,
      enum: Object.values(SUBSCRIPTION_STATUS),
      default: SUBSCRIPTION_STATUS.TRIALING,
    },
    currentPeriodStart: {
      type: Date,
      default: null,
    },
    currentPeriodEnd: {
      type: Date,
      default: null,
    },
    payuSubscriptionId: {
      type: String,
      default: null,
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
    planId: this.planId,
    subscriptionStatus: this.subscriptionStatus,
    currentPeriodStart: this.currentPeriodStart,
    currentPeriodEnd: this.currentPeriodEnd,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
  };
};
