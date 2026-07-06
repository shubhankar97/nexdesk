import { ROLES } from '../constants/roles.js';
import { computeOrderStatus } from '../constants/order.js';
import { getTenantId, getTenantModels } from '../context/tenantContext.js';
import * as orderRepository from '../repositories/order.repository.js';
import { ApiError } from '../utils/ApiError.js';

const formatCustomer = (customer) =>
  customer
    ? { id: customer._id.toString(), email: customer.email }
    : customer;

const formatOrder = (order) => ({
  ...order.toSafeObject(getTenantId()),
  customer: formatCustomer(order.customer),
});

const assertOrderAccess = (order, user) => {
  if (user.role === ROLES.CUSTOMER && order.customer.toString() !== user.sub) {
    throw new ApiError(403, 'Access denied for this order');
  }
};

const validateCustomer = async (customerId) => {
  const models = getTenantModels();

  if (!models) {
    throw new ApiError(400, 'Tenant context required');
  }

  const customer = await models.User.findOne({
    _id: customerId,
    role: ROLES.CUSTOMER,
    isActive: true,
  });

  if (!customer) {
    throw new ApiError(400, 'Invalid customer');
  }

  return customer;
};

export const listOrderCustomers = async () => {
  const models = getTenantModels();

  if (!models) {
    throw new ApiError(400, 'Tenant context required');
  }

  const customers = await models.User.find({ role: ROLES.CUSTOMER, isActive: true })
    .select('email')
    .sort({ email: 1 });

  return customers.map((customer) => ({
    id: customer._id.toString(),
    email: customer.email,
  }));
};

export const listOrders = async (filters, user) => {
  const query = { ...filters };

  if (user.role === ROLES.CUSTOMER) {
    query.customer = user.sub;
  }

  const orders = await orderRepository.findOrders(query);
  return orders.map(formatOrder);
};

export const getOrderById = async (id, user) => {
  const order = await orderRepository.findOrderById(id);

  if (!order) {
    throw new ApiError(404, 'Order not found');
  }

  assertOrderAccess(order, user);
  return formatOrder(order);
};

export const createOrder = async (payload) => {
  if (!getTenantId()) {
    throw new ApiError(400, 'Tenant context required');
  }

  await validateCustomer(payload.customer);

  const order = await orderRepository.createOrder({
    ...payload,
    status: computeOrderStatus(payload.validity, payload.nextRenewal),
  });
  const populated = await orderRepository.findOrderById(order._id);
  return formatOrder(populated);
};

export const updateOrder = async (id, payload) => {
  if (payload.customer) {
    await validateCustomer(payload.customer);
  }

  const order = await orderRepository.findOrderDocumentById(id);

  if (!order) {
    throw new ApiError(404, 'Order not found');
  }

  const validity = payload.validity ?? order.validity;
  const nextRenewal = payload.nextRenewal ?? order.nextRenewal;

  if (payload.validity || payload.nextRenewal) {
    payload.status = computeOrderStatus(validity, nextRenewal);
  }

  Object.assign(order, payload);
  await order.save();

  const populated = await orderRepository.findOrderById(order._id);
  return formatOrder(populated);
};

export const deleteOrder = async (id) => {
  const order = await orderRepository.deleteOrderById(id);

  if (!order) {
    throw new ApiError(404, 'Order not found');
  }

  return { id: order._id };
};

export const uploadCertificate = async (id, fileData) => {
  const order = await orderRepository.findOrderDocumentById(id);

  if (!order) {
    throw new ApiError(404, 'Order not found');
  }

  if (order.currentCertificate?.fileUrl) {
    order.certificateVersions.push({
      fileName: order.currentCertificate.fileName,
      fileUrl: order.currentCertificate.fileUrl,
      uploadedAt: order.currentCertificate.uploadedAt ?? new Date(),
    });
  }

  order.currentCertificate = {
    fileName: fileData.fileName,
    fileUrl: fileData.fileUrl,
    uploadedAt: new Date(),
  };

  await order.save();
  return order.toSafeObject(getTenantId());
};

export const downloadCertificate = async (id, user) => {
  const order = await orderRepository.findOrderDocumentById(id);

  if (!order) {
    throw new ApiError(404, 'Order not found');
  }

  assertOrderAccess(order, user);

  if (!order.currentCertificate?.fileUrl) {
    throw new ApiError(404, 'No certificate available for download');
  }

  return {
    fileName: order.currentCertificate.fileName,
    fileUrl: order.currentCertificate.fileUrl,
    uploadedAt: order.currentCertificate.uploadedAt,
  };
};

export const getCertificateVersions = async (id, user) => {
  const order = await orderRepository.findOrderDocumentById(id);

  if (!order) {
    throw new ApiError(404, 'Order not found');
  }

  assertOrderAccess(order, user);

  return order.certificateVersions.map((version) => ({
    id: version._id,
    fileName: version.fileName,
    fileUrl: version.fileUrl,
    uploadedAt: version.uploadedAt,
  }));
};
