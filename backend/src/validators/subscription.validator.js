import { ApiError } from '../utils/ApiError.js';

export const validatePlanId = (input) => {
  const planId = input?.planId ?? input;

  if (!planId || typeof planId !== 'string') {
    throw new ApiError(400, 'Plan ID is required');
  }

  return { planId: planId.trim() };
};

export const validateCheckout = (body) => {
  const { planId } = body ?? {};

  if (!planId || typeof planId !== 'string') {
    throw new ApiError(400, 'Plan ID is required');
  }

  return { planId: planId.trim() };
};
