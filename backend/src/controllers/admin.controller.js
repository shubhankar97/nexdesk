import { asyncHandler } from '../utils/asyncHandler.js';
import * as adminService from '../services/admin.service.js';
import {
  validateAdminParams,
  validateCreateAdmin,
  validateUpdateAdmin,
} from '../validators/admin.validator.js';

export const listAdmins = asyncHandler(async (_req, res) => {
  const data = await adminService.listAdmins();

  res.status(200).json({
    success: true,
    data,
  });
});

export const createAdmin = asyncHandler(async (req, res) => {
  const payload = validateCreateAdmin(req.body);
  const data = await adminService.createAdmin(payload);

  res.status(201).json({
    success: true,
    data,
  });
});

export const updateAdmin = asyncHandler(async (req, res) => {
  const { tenantId, adminId } = validateAdminParams(req.params);
  const payload = validateUpdateAdmin(req.body);
  const data = await adminService.updateAdmin(tenantId, adminId, payload);

  res.status(200).json({
    success: true,
    data,
  });
});

export const deleteAdmin = asyncHandler(async (req, res) => {
  const { tenantId, adminId } = validateAdminParams(req.params);
  const data = await adminService.deleteAdmin(tenantId, adminId);

  res.status(200).json({
    success: true,
    data,
  });
});
