import { asyncHandler } from '../utils/asyncHandler.js';
import * as tenantService from '../services/tenant.service.js';
import * as usageService from '../services/usage.service.js';
import {
  validateCreateTenant,
  validateTenantId,
  validateUpdateTenant,
} from '../validators/tenant.validator.js';

export const getCurrentTenant = asyncHandler(async (req, res) => {
  const data = await usageService.enrichTenantWithPlan(req.tenant);

  res.status(200).json({
    success: true,
    data,
  });
});

export const listTenants = asyncHandler(async (_req, res) => {
  const data = await tenantService.listTenants();

  res.status(200).json({
    success: true,
    data,
  });
});

export const getTenant = asyncHandler(async (req, res) => {
  const { tenantId } = validateTenantId(req.params);
  const data = await tenantService.getTenantById(tenantId);

  res.status(200).json({
    success: true,
    data,
  });
});

export const createTenant = asyncHandler(async (req, res) => {
  const payload = validateCreateTenant(req.body);
  const data = await tenantService.createTenant(payload);

  res.status(201).json({
    success: true,
    data,
  });
});

export const updateTenant = asyncHandler(async (req, res) => {
  const { tenantId } = validateTenantId(req.params);
  const payload = validateUpdateTenant(req.body);
  const data = await tenantService.updateTenant(tenantId, payload);

  res.status(200).json({
    success: true,
    data,
  });
});

export const deleteTenant = asyncHandler(async (req, res) => {
  const { tenantId } = validateTenantId(req.params);
  const data = await tenantService.deleteTenant(tenantId);

  res.status(200).json({
    success: true,
    data,
  });
});
