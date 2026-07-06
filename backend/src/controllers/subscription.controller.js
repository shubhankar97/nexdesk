import { asyncHandler } from '../utils/asyncHandler.js';
import * as subscriptionService from '../services/subscription.service.js';
import { validateCheckout } from '../validators/subscription.validator.js';

export const getSubscription = asyncHandler(async (req, res) => {
  const data = await subscriptionService.getTenantSubscription(req.tenant);

  res.status(200).json({
    success: true,
    data,
  });
});

export const listAvailablePlans = asyncHandler(async (_req, res) => {
  const data = await subscriptionService.listPlans();

  res.status(200).json({
    success: true,
    data,
  });
});

export const createCheckout = asyncHandler(async (req, res) => {
  const { planId } = validateCheckout(req.body);
  const data = await subscriptionService.createCheckout(req.tenant, planId);

  res.status(200).json({
    success: true,
    data,
  });
});
