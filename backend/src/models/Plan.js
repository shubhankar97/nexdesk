import crypto from 'crypto';
import mongoose from 'mongoose';
import { BILLING_INTERVAL } from '../constants/subscription.js';

export const planSchema = new mongoose.Schema(
  {
    planId: {
      type: String,
      required: true,
      unique: true,
      default: () => crypto.randomUUID(),
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    currency: {
      type: String,
      default: 'INR',
      uppercase: true,
      trim: true,
    },
    interval: {
      type: String,
      enum: Object.values(BILLING_INTERVAL),
      required: true,
    },
    trialDays: {
      type: Number,
      default: 0,
      min: 0,
    },
    features: {
      type: [String],
      default: [],
    },
    limits: {
      documentAi: {
        uploadsPerMonth: {
          type: Number,
          default: null,
          min: 0,
        },
      },
    },
    payuPlanId: {
      type: String,
      trim: true,
      default: null,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

planSchema.methods.toSafeObject = function toSafeObject() {
  return {
    planId: this.planId,
    name: this.name,
    slug: this.slug,
    description: this.description,
    price: this.price,
    currency: this.currency,
    interval: this.interval,
    trialDays: this.trialDays,
    features: this.features,
    limits: {
      documentAi: {
        uploadsPerMonth:
          this.limits?.documentAi?.uploadsPerMonth === undefined
            ? null
            : this.limits.documentAi.uploadsPerMonth,
      },
    },
    isActive: this.isActive,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
  };
};

