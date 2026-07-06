import { asyncHandler } from '../utils/asyncHandler.js';
import * as orderService from '../services/order.service.js';
import {
  validateCreateOrder,
  validateListOrders,
  validateOrderId,
  validateUpdateOrder,
  validateUploadCertificate,
} from '../validators/order.validator.js';

export const listOrders = asyncHandler(async (req, res) => {
  const filters = validateListOrders(req.query);
  const data = await orderService.listOrders(filters, req.user);

  res.status(200).json({
    success: true,
    data,
  });
});

export const getOrder = asyncHandler(async (req, res) => {
  const { id } = validateOrderId(req.params);
  const data = await orderService.getOrderById(id, req.user);

  res.status(200).json({
    success: true,
    data,
  });
});

export const createOrder = asyncHandler(async (req, res) => {
  const payload = validateCreateOrder(req.body);
  const data = await orderService.createOrder(payload, req.tenantId);

  res.status(201).json({
    success: true,
    data,
  });
});

export const updateOrder = asyncHandler(async (req, res) => {
  const { id } = validateOrderId(req.params);
  const payload = validateUpdateOrder(req.body);
  const data = await orderService.updateOrder(id, payload);

  res.status(200).json({
    success: true,
    data,
  });
});

export const deleteOrder = asyncHandler(async (req, res) => {
  const { id } = validateOrderId(req.params);
  const data = await orderService.deleteOrder(id);

  res.status(200).json({
    success: true,
    data,
  });
});

export const uploadCertificate = asyncHandler(async (req, res) => {
  const { id } = validateOrderId(req.params);
  const fileData = validateUploadCertificate(req.body);
  const data = await orderService.uploadCertificate(id, fileData);

  res.status(200).json({
    success: true,
    data,
  });
});

export const downloadCertificate = asyncHandler(async (req, res) => {
  const { id } = validateOrderId(req.params);
  const data = await orderService.downloadCertificate(id, req.user);

  res.status(200).json({
    success: true,
    data,
  });
});

export const getCertificateVersions = asyncHandler(async (req, res) => {
  const { id } = validateOrderId(req.params);
  const data = await orderService.getCertificateVersions(id, req.user);

  res.status(200).json({
    success: true,
    data,
  });
});

export const listOrderCustomers = asyncHandler(async (req, res) => {
  const data = await orderService.listOrderCustomers();

  res.status(200).json({
    success: true,
    data,
  });
});
