import * as tenantRepository from '../repositories/tenant.repository.js';
import {
  dropTenantCollections,
  provisionTenantCollections,
} from '../database/tenantConnection.js';
import { ApiError } from '../utils/ApiError.js';

const formatTenant = (tenant) => tenant.toSafeObject();

export const listTenants = async () => {
  const tenants = await tenantRepository.findTenants();
  return tenants.map(formatTenant);
};

export const getTenantById = async (tenantId) => {
  const tenant = await tenantRepository.findTenantById(tenantId);

  if (!tenant) {
    throw new ApiError(404, 'Tenant not found');
  }

  return formatTenant(tenant);
};

export const createTenant = async (payload) => {
  const existing = await tenantRepository.findTenantBySubdomain(payload.subdomain);

  if (existing) {
    throw new ApiError(409, 'Subdomain is already in use');
  }

  const tenant = await tenantRepository.createTenant(payload);
  await provisionTenantCollections(tenant);

  return formatTenant(tenant);
};

export const updateTenant = async (tenantId, payload) => {
  const $set = {};

  if (payload.companyName !== undefined) {
    $set.companyName = payload.companyName;
  }

  if (payload.isActive !== undefined) {
    $set.isActive = payload.isActive;
  }

  if (payload.addons?.documentAi !== undefined) {
    $set['addons.documentAi'] = payload.addons.documentAi;
  }

  if (payload.addons?.documentAiPlanOverride !== undefined) {
    $set['addons.documentAiPlanOverride'] = payload.addons.documentAiPlanOverride;
  }

  if (!Object.keys($set).length) {
    throw new ApiError(400, 'No valid fields to update');
  }

  const tenant = await tenantRepository.updateTenantById(tenantId, { $set });

  if (!tenant) {
    throw new ApiError(404, 'Tenant not found');
  }

  return formatTenant(tenant);
};

export const deleteTenant = async (tenantId) => {
  const tenant = await tenantRepository.findTenantById(tenantId);

  if (!tenant) {
    throw new ApiError(404, 'Tenant not found');
  }

  await dropTenantCollections(tenant.subdomain);
  await tenantRepository.deleteTenantById(tenantId);

  return { tenantId };
};
