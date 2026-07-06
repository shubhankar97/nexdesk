import { getPlatformModels } from '../config/database.js';

export const findTenants = (filter = {}) => {
  const { Tenant } = getPlatformModels();
  return Tenant.find(filter).sort({ createdAt: -1 });
};

export const findTenantById = (tenantId) => {
  const { Tenant } = getPlatformModels();
  return Tenant.findOne({ tenantId });
};

export const findTenantBySubdomain = (subdomain) => {
  const { Tenant } = getPlatformModels();
  return Tenant.findOne({ subdomain: subdomain.toLowerCase() });
};

export const createTenant = (data) => {
  const { Tenant } = getPlatformModels();
  return Tenant.create(data);
};

export const updateTenantById = (tenantId, data) => {
  const { Tenant } = getPlatformModels();
  return Tenant.findOneAndUpdate({ tenantId }, data, { new: true, runValidators: true });
};

export const deleteTenantById = (tenantId) => {
  const { Tenant } = getPlatformModels();
  return Tenant.findOneAndDelete({ tenantId });
};
