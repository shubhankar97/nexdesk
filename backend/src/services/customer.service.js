import { ROLES } from '../constants/roles.js';
import { getTenantId, getTenantModels } from '../context/tenantContext.js';
import { ApiError } from '../utils/ApiError.js';

const requireTenantModels = () => {
  const models = getTenantModels();

  if (!models) {
    throw new ApiError(400, 'Tenant context required');
  }

  return models;
};

const formatCustomer = (user) => user.toSafeObject(getTenantId());

export const listCustomers = async () => {
  const { User } = requireTenantModels();
  const customers = await User.find({ role: ROLES.CUSTOMER }).sort({ email: 1 });
  return customers.map(formatCustomer);
};

export const createCustomer = async ({ email, password, isActive = true }) => {
  const { User } = requireTenantModels();
  const normalizedEmail = email.toLowerCase();
  const existing = await User.findOne({ email: normalizedEmail });

  if (existing) {
    throw new ApiError(409, 'Email already in use for this tenant');
  }

  const customer = await User.create({
    email: normalizedEmail,
    password,
    role: ROLES.CUSTOMER,
    isActive,
  });

  return formatCustomer(customer);
};

export const updateCustomer = async (customerId, { email, password, isActive }) => {
  const { User } = requireTenantModels();
  const customer = await User.findOne({ _id: customerId, role: ROLES.CUSTOMER });

  if (!customer) {
    throw new ApiError(404, 'Customer not found');
  }

  if (email !== undefined) {
    const normalizedEmail = email.toLowerCase();
    const duplicate = await User.findOne({
      email: normalizedEmail,
      _id: { $ne: customerId },
    });

    if (duplicate) {
      throw new ApiError(409, 'Email already in use for this tenant');
    }

    customer.email = normalizedEmail;
  }

  if (isActive !== undefined) {
    customer.isActive = isActive;
  }

  if (password) {
    customer.password = password;
  }

  await customer.save();
  return formatCustomer(customer);
};

export const deleteCustomer = async (customerId) => {
  const { User, Order } = requireTenantModels();
  const customer = await User.findOne({ _id: customerId, role: ROLES.CUSTOMER });

  if (!customer) {
    throw new ApiError(404, 'Customer not found');
  }

  const orderCount = await Order.countDocuments({ customer: customerId });

  if (orderCount > 0) {
    throw new ApiError(
      409,
      `Cannot delete customer with ${orderCount} linked order${orderCount === 1 ? '' : 's'}. Deactivate instead.`
    );
  }

  await User.findByIdAndDelete(customerId);
  return { id: customerId };
};
