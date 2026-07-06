import { BILLING_INTERVAL } from '../constants/subscription.js';
import { ApiError } from '../utils/ApiError.js';

const isValidInterval = (value) => Object.values(BILLING_INTERVAL).includes(value);

export const validatePlanId = (input) => {
  const planId = input?.planId ?? input;

  if (!planId || typeof planId !== 'string') {
    throw new ApiError(400, 'Plan ID is required');
  }

  return { planId: planId.trim() };
};

export const validateCreatePlan = (body) => {
  const { name, slug, description, price, currency, interval, trialDays, features, payuPlanId } =
    body ?? {};

  if (!name?.trim()) {
    throw new ApiError(400, 'Plan name is required');
  }

  if (!slug?.trim()) {
    throw new ApiError(400, 'Plan slug is required');
  }

  if (price === undefined || price === null || Number(price) < 0) {
    throw new ApiError(400, 'Valid plan price is required');
  }

  if (!isValidInterval(interval)) {
    throw new ApiError(400, 'Valid billing interval is required');
  }

  return {
    name: name.trim(),
    slug: slug.trim().toLowerCase(),
    description: description?.trim() ?? '',
    price: Number(price),
    currency: currency?.trim().toUpperCase() ?? 'INR',
    interval,
    trialDays: trialDays !== undefined ? Number(trialDays) : 0,
    features: Array.isArray(features) ? features.map(String) : [],
    payuPlanId: payuPlanId?.trim() || null,
  };
};

export const validateUpdatePlan = (body) => {
  const payload = {};

  if (body.name !== undefined) {
    if (!body.name?.trim()) {
      throw new ApiError(400, 'Plan name cannot be empty');
    }
    payload.name = body.name.trim();
  }

  if (body.description !== undefined) {
    payload.description = body.description?.trim() ?? '';
  }

  if (body.price !== undefined) {
    if (Number(body.price) < 0) {
      throw new ApiError(400, 'Valid plan price is required');
    }
    payload.price = Number(body.price);
  }

  if (body.interval !== undefined) {
    if (!isValidInterval(body.interval)) {
      throw new ApiError(400, 'Valid billing interval is required');
    }
    payload.interval = body.interval;
  }

  if (body.trialDays !== undefined) {
    payload.trialDays = Number(body.trialDays);
  }

  if (body.features !== undefined) {
    payload.features = Array.isArray(body.features) ? body.features.map(String) : [];
  }

  if (body.payuPlanId !== undefined) {
    payload.payuPlanId = body.payuPlanId?.trim() || null;
  }

  if (body.isActive !== undefined) {
    payload.isActive = Boolean(body.isActive);
  }

  if (Object.keys(payload).length === 0) {
    throw new ApiError(400, 'No valid fields to update');
  }

  return payload;
};
