import { asyncHandler } from '../utils/asyncHandler.js';
import * as subscriptionService from '../services/subscription.service.js';

export const handlePayuPaymentWebhook = asyncHandler(async (req, res) => {
  await subscriptionService.handlePaymentWebhook(req.body);

  res.status(200).send('success');
});

export const handlePayuZionWebhook = asyncHandler(async (req, res) => {
  await subscriptionService.handleZionWebhook(req.body);

  res.status(200).json({ success: true });
});
