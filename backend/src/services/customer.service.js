import { ROLES } from '../constants/roles.js';
import { getTenantId, getTenantModels, runWithTenantContext } from '../context/tenantContext.js';
import { getTenantModelsForTenant } from '../database/tenantConnection.js';
import * as tenantRepository from '../repositories/tenant.repository.js';
import { ApiError } from '../utils/ApiError.js';

const requireTenantModels = () => {
  const models = getTenantModels();

  if (!models) {
    throw new ApiError(400, 'Tenant context required');
  }

  return models;
};

const formatCustomer = (user, tenantId = getTenantId(), tenant = null) => ({
  ...user.toSafeObject(tenantId),
  ...(tenant
    ? {
        tenantName: tenant.companyName,
        subdomain: tenant.subdomain,
      }
    : {}),
});

const withTenantContext = async (tenant, fn) => {
  const context = await getTenantModelsForTenant(tenant);
  return runWithTenantContext(
    { tenant, tenantId: tenant.tenantId, connection: context.connection, models: context.models },
    () => fn(context.models)
  );
};

export const listCustomers = async () => {
  const { User } = requireTenantModels();
  const customers = await User.find({ role: ROLES.CUSTOMER }).sort({ email: 1 });
  return customers.map((user) => formatCustomer(user));
};

export const listAllCustomers = async () => {
  const tenants = await tenantRepository.findTenants();
  const customers = [];

  for (const tenant of tenants) {
    const tenantCustomers = await withTenantContext(tenant, async (models) =>
      models.User.find({ role: ROLES.CUSTOMER }).sort({ email: 1 })
    );

    customers.push(...tenantCustomers.map((user) => formatCustomer(user, tenant.tenantId, tenant)));
  }

  return customers.sort((a, b) => a.email.localeCompare(b.email));
};

export const createCustomer = async ({ name, email, mobile }) => {
  const { User } = requireTenantModels();
  const normalizedEmail = email.toLowerCase();
  const existing = await User.findOne({ email: normalizedEmail });

  if (existing) {
    throw new ApiError(409, 'Email already in use for this tenant');
  }

  const customer = await User.create({
    name,
    email: normalizedEmail,
    mobile,
    role: ROLES.CUSTOMER,
    isActive: false,
  });

  return formatCustomer(customer);
};

export const updateCustomer = async (customerId, { name, email, mobile }) => {
  const { User } = requireTenantModels();
  const customer = await User.findOne({ _id: customerId, role: ROLES.CUSTOMER });

  if (!customer) {
    throw new ApiError(404, 'Customer not found');
  }

  if (name !== undefined) {
    customer.name = name;
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

  if (mobile !== undefined) {
    customer.mobile = mobile;
  }

  await customer.save();
  return formatCustomer(customer);
};

export const updateCustomerForMaster = async (
  tenantId,
  customerId,
  { name, email, mobile, password, isActive }
) => {
  const tenant = await tenantRepository.findTenantById(tenantId);

  if (!tenant) {
    throw new ApiError(404, 'Tenant not found');
  }

  const user = await withTenantContext(tenant, async (models) => {
    const customer = await models.User.findOne({ _id: customerId, role: ROLES.CUSTOMER }).select(
      '+password'
    );

    if (!customer) {
      throw new ApiError(404, 'Customer not found');
    }

    if (name !== undefined) {
      customer.name = name;
    }

    if (email !== undefined) {
      const normalizedEmail = email.toLowerCase();
      const duplicate = await models.User.findOne({
        email: normalizedEmail,
        _id: { $ne: customerId },
      });

      if (duplicate) {
        throw new ApiError(409, 'Email already in use for this tenant');
      }

      customer.email = normalizedEmail;
    }

    if (mobile !== undefined) {
      customer.mobile = mobile;
    }

    if (password) {
      customer.password = password;
    }

    if (isActive !== undefined) {
      if (isActive && !customer.password && !password) {
        throw new ApiError(400, 'Password is required to activate a customer');
      }

      customer.isActive = isActive;
    }

    await customer.save();
    return customer;
  });

  return formatCustomer(user, tenant.tenantId, tenant);
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

export const deleteCustomerForMaster = async (tenantId, customerId) => {
  const tenant = await tenantRepository.findTenantById(tenantId);

  if (!tenant) {
    throw new ApiError(404, 'Tenant not found');
  }

  await withTenantContext(tenant, async (models) => {
    const customer = await models.User.findOne({ _id: customerId, role: ROLES.CUSTOMER });

    if (!customer) {
      throw new ApiError(404, 'Customer not found');
    }

    const orderCount = await models.Order.countDocuments({ customer: customerId });

    if (orderCount > 0) {
      throw new ApiError(
        409,
        `Cannot delete customer with ${orderCount} linked order${orderCount === 1 ? '' : 's'}. Deactivate instead.`
      );
    }

    await models.User.findByIdAndDelete(customerId);
  });

  return { id: customerId, tenantId };
};
