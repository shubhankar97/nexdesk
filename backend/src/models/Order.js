import mongoose from 'mongoose';
import { computeOrderStatus } from '../constants/order.js';
import { tenantPlugin } from '../plugins/tenantPlugin.js';

const certificateVersionSchema = new mongoose.Schema(
  {
    fileName: {
      type: String,
      required: true,
      trim: true,
    },
    fileUrl: {
      type: String,
      required: true,
      trim: true,
    },
    uploadedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: true }
);

const orderSchema = new mongoose.Schema(
  {
    certificateName: {
      type: String,
      required: true,
      trim: true,
    },
    issueDate: {
      type: Date,
      required: true,
    },
    validity: {
      type: Date,
      required: true,
    },
    nextRenewal: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ['Expired', 'Active', 'Due for renewal'],
      required: true,
    },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    currentCertificate: {
      fileName: { type: String, trim: true },
      fileUrl: { type: String, trim: true },
      uploadedAt: { type: Date },
    },
    certificateVersions: {
      type: [certificateVersionSchema],
      default: [],
    },
  },
  { timestamps: true }
);

orderSchema.plugin(tenantPlugin);

orderSchema.index({ customer: 1, tenantId: 1 });
orderSchema.index({ certificateName: 1, tenantId: 1 });

orderSchema.pre('validate', function updateStatus(next) {
  if (this.validity && this.nextRenewal) {
    this.status = computeOrderStatus(this.validity, this.nextRenewal);
  }

  next();
});

orderSchema.methods.toSafeObject = function toSafeObject() {
  return {
    id: this._id,
    certificateName: this.certificateName,
    issueDate: this.issueDate,
    validity: this.validity,
    nextRenewal: this.nextRenewal,
    status: this.status,
    customer: this.customer,
    currentCertificate: this.currentCertificate?.fileUrl
      ? {
          fileName: this.currentCertificate.fileName,
          fileUrl: this.currentCertificate.fileUrl,
          uploadedAt: this.currentCertificate.uploadedAt,
        }
      : null,
    certificateVersions: this.certificateVersions.map((version) => ({
      id: version._id,
      fileName: version.fileName,
      fileUrl: version.fileUrl,
      uploadedAt: version.uploadedAt,
    })),
    tenantId: this.tenantId,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
  };
};

export const Order = mongoose.model('Order', orderSchema);
