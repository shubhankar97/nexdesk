import { getTenantModels } from '../context/tenantContext.js';

const requireTenantModels = () => {
  const models = getTenantModels();

  if (!models) {
    throw new Error('Tenant context required');
  }

  return models;
};

export const findOrders = (filter) => {
  const { Order } = requireTenantModels();
  return Order.find(filter).populate('customer', 'email').sort({ createdAt: -1 });
};

export const findOrderById = (id) => {
  const { Order } = requireTenantModels();
  return Order.findById(id).populate('customer', 'email');
};

export const findOrderDocumentById = (id) => {
  const { Order } = requireTenantModels();
  return Order.findById(id);
};

export const createOrder = (data) => {
  const { Order } = requireTenantModels();
  return Order.create(data);
};

export const deleteOrderById = (id) => {
  const { Order } = requireTenantModels();
  return Order.findByIdAndDelete(id);
};
