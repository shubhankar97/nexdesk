import { Order } from '../models/Order.js';

export const findOrders = (filter) =>
  Order.find(filter).populate('customer', 'email').sort({ createdAt: -1 });

export const findOrderById = (id) => Order.findById(id).populate('customer', 'email');

export const findOrderDocumentById = (id) => Order.findById(id);

export const createOrder = (data) => Order.create(data);

export const deleteOrderById = (id) => Order.findByIdAndDelete(id);
