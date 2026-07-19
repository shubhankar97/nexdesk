import mongoose from 'mongoose';
import { MODULES } from '../constants/modules.js';

export const usageCounterSchema = new mongoose.Schema(
  {
    tenantId: {
      type: String,
      required: true,
      index: true,
    },
    module: {
      type: String,
      required: true,
      default: MODULES.DOCUMENT_AI,
    },
    periodKey: {
      type: String,
      required: true,
    },
    uploads: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  { timestamps: true }
);

usageCounterSchema.index({ tenantId: 1, module: 1, periodKey: 1 }, { unique: true });
