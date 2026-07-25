import crypto from 'crypto';
import mongoose from 'mongoose';
import { formatTenantAddons } from '../constants/modules.js';
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
    addons: {
      documentAi: {
        type: Boolean,
        default: false,
      },
      documentAiPlanOverride: {
        type: Boolean,
        default: false,
      },
      orders: {
        type: Boolean,
        default: true,
      },
      customers: {
        type: Boolean,
        default: true,
      },
      reports: {
        type: Boolean,
        default: true,
      },
      notifications: {
        type: Boolean,
        default: true,
      },
      settings: {
        type: Boolean,
        default: true,
      },
      customerDocuments: {
        type: Boolean,
        default: true,
      },
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
    addons: formatTenantAddons(this.addons),
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
  };
};
