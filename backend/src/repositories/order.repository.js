import { getTenantModels } from '../context/tenantContext.js';

const requireTenantModels = () => {
  const models = getTenantModels();

  if (!models) {
    throw new Error('Tenant context required');
  }

  return models;
};

export const findOrders = (filter) => {
  const { Order, User } = requireTenantModels();
  return Order.find(filter)
    .populate({ path: 'customer', model: User, select: 'email' })
    .sort({ createdAt: -1 });
};

export const findOrderById = (id) => {
  const { Order, User } = requireTenantModels();
  return Order.findById(id).populate({ path: 'customer', model: User, select: 'email' });
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
