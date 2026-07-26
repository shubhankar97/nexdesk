import { asyncHandler } from '../utils/asyncHandler.js';
import * as customerService from '../services/customer.service.js';
import {
  validateCreateCustomer,
  validateCustomerId,
  validateMasterCustomerParams,
  validateMasterUpdateCustomer,
  validateUpdateCustomer,
} from '../validators/customer.validator.js';

export const listCustomers = asyncHandler(async (_req, res) => {
  const data = await customerService.listCustomers();

  res.status(200).json({
    success: true,
    data,
  });
});

export const listAllCustomers = asyncHandler(async (_req, res) => {
  const data = await customerService.listAllCustomers();

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

export const updateCustomerForMaster = asyncHandler(async (req, res) => {
  const { tenantId, customerId } = validateMasterCustomerParams(req.params);
  const payload = validateMasterUpdateCustomer(req.body);
  const data = await customerService.updateCustomerForMaster(tenantId, customerId, payload);

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

export const deleteCustomerForMaster = asyncHandler(async (req, res) => {
  const { tenantId, customerId } = validateMasterCustomerParams(req.params);
  const data = await customerService.deleteCustomerForMaster(tenantId, customerId);

  res.status(200).json({
    success: true,
    data,
  });
});
