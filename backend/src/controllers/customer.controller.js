import { asyncHandler } from '../utils/asyncHandler.js';
import * as customerService from '../services/customer.service.js';
import {
  validateCreateCustomer,
  validateCustomerId,
  validateUpdateCustomer,
} from '../validators/customer.validator.js';

export const listCustomers = asyncHandler(async (_req, res) => {
  const data = await customerService.listCustomers();

  res.status(200).json({
    success: true,
    data,
  });
});

export const createCustomer = asyncHandler(async (req, res) => {
  const payload = validateCreateCustomer(req.body);
  const data = await customerService.createCustomer(payload);

  res.status(201).json({
    success: true,
    data,
  });
});

export const updateCustomer = asyncHandler(async (req, res) => {
  const customerId = validateCustomerId(req.params);
  const payload = validateUpdateCustomer(req.body);
  const data = await customerService.updateCustomer(customerId, payload);

  res.status(200).json({
    success: true,
    data,
  });
});

export const deleteCustomer = asyncHandler(async (req, res) => {
  const customerId = validateCustomerId(req.params);
  const data = await customerService.deleteCustomer(customerId);

  res.status(200).json({
    success: true,
    data,
  });
});
