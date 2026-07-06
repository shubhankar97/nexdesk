import { ROLES } from '../constants/roles.js';
import * as tenantRepository from '../repositories/tenant.repository.js';
import { getTenantModelsForTenant } from '../database/tenantConnection.js';
import { runWithTenantContext } from '../context/tenantContext.js';
import { ApiError } from '../utils/ApiError.js';

const formatAdmin = (user, tenant) => ({
  ...user.toSafeObject(tenant.tenantId),
  tenantName: tenant.companyName,
  subdomain: tenant.subdomain,
});

const withTenantContext = async (tenant, fn) => {
  const context = await getTenantModelsForTenant(tenant);
  return runWithTenantContext(
    { tenant, tenantId: tenant.tenantId, connection: context.connection, models: context.models },
    () => fn(context.models)
  );
};

export const listAdmins = async () => {
  const tenants = await tenantRepository.findTenants();
  const admins = [];

  for (const tenant of tenants) {
    const tenantAdmins = await withTenantContext(tenant, async (models) =>
      models.User.find({ role: ROLES.ADMIN }).sort({ email: 1 })
    );

    admins.push(...tenantAdmins.map((user) => formatAdmin(user, tenant)));
  }

  return admins.sort((a, b) => a.email.localeCompare(b.email));
};

export const createAdmin = async ({ tenantId, email, password, isActive = true }) => {
  const tenant = await tenantRepository.findTenantById(tenantId);

  if (!tenant) {
    throw new ApiError(404, 'Tenant not found');
  }

  const user = await withTenantContext(tenant, async (models) => {
    const existing = await models.User.findOne({ email: email.toLowerCase() });

    if (existing) {
      throw new ApiError(409, 'Email already in use for this tenant');
    }

    return models.User.create({
      email: email.toLowerCase(),
      password,
      role: ROLES.ADMIN,
      isActive,
    });
  });

  return formatAdmin(user, tenant);
};

export const updateAdmin = async (tenantId, adminId, { email, password, isActive }) => {
  const tenant = await tenantRepository.findTenantById(tenantId);

  if (!tenant) {
    throw new ApiError(404, 'Tenant not found');
  }

  const user = await withTenantContext(tenant, async (models) => {
    const admin = await models.User.findOne({ _id: adminId, role: ROLES.ADMIN });

    if (!admin) {
      throw new ApiError(404, 'Admin not found');
    }

    if (email !== undefined) {
      const normalizedEmail = email.toLowerCase();
      const duplicate = await models.User.findOne({
        email: normalizedEmail,
        _id: { $ne: adminId },
      });

      if (duplicate) {
        throw new ApiError(409, 'Email already in use for this tenant');
      }

      admin.email = normalizedEmail;
    }

    if (isActive !== undefined) {
      admin.isActive = isActive;
    }

    if (password) {
      admin.password = password;
    }

    await admin.save();
    return admin;
  });

  return formatAdmin(user, tenant);
};

export const deleteAdmin = async (tenantId, adminId) => {
  const tenant = await tenantRepository.findTenantById(tenantId);

  if (!tenant) {
    throw new ApiError(404, 'Tenant not found');
  }

  await withTenantContext(tenant, async (models) => {
    const admin = await models.User.findOneAndDelete({ _id: adminId, role: ROLES.ADMIN });

    if (!admin) {
      throw new ApiError(404, 'Admin not found');
    }

    return admin;
  });

  return { id: adminId, tenantId };
};
