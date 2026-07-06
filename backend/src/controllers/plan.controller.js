import { asyncHandler } from '../utils/asyncHandler.js';
import { getPlatformModels } from '../config/database.js';
import * as subscriptionService from '../services/subscription.service.js';
import {
  validateCreatePlan,
  validatePlanId,
  validateUpdatePlan,
} from '../validators/plan.validator.js';
import { ApiError } from '../utils/ApiError.js';

export const listPlans = asyncHandler(async (_req, res) => {
  const data = await subscriptionService.listPlans();

  res.status(200).json({
    success: true,
    data,
  });
});

export const getPlan = asyncHandler(async (req, res) => {
  const { planId } = validatePlanId(req.params);
  const data = await subscriptionService.getPlanById(planId);

  res.status(200).json({
    success: true,
    data,
  });
});

export const createPlan = asyncHandler(async (req, res) => {
  const payload = validateCreatePlan(req.body);
  const data = await subscriptionService.createPlan(payload);

  res.status(201).json({
    success: true,
    data,
  });
});

export const updatePlan = asyncHandler(async (req, res) => {
  const { planId } = validatePlanId(req.params);
  const payload = validateUpdatePlan(req.body);
  const data = await subscriptionService.updatePlan(planId, payload);

  res.status(200).json({
    success: true,
    data,
  });
});

export const assignPlanToTenant = asyncHandler(async (req, res) => {
  const { planId } = validatePlanId(req.params);
  const { tenantId } = req.body ?? {};

  if (!tenantId || typeof tenantId !== 'string') {
    throw new ApiError(400, 'Tenant ID is required');
  }

  const { Tenant } = getPlatformModels();
  const tenant = await Tenant.findOne({ tenantId: tenantId.trim() });

  if (!tenant) {
    throw new ApiError(404, 'Tenant not found');
  }

  const data = await subscriptionService.assignPlanToTenant(tenant, planId);

  res.status(200).json({
    success: true,
    data,
  });
});
