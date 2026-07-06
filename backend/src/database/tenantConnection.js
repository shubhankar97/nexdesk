import { getPlatformConnection } from '../config/database.js';
import { getTenantCollections } from '../utils/tenantCollections.js';
import { registerTenantModels } from './tenantModels.js';

const tenantModelCache = new Map();

export const getTenantModelsForTenant = async (tenant) => {
  const cacheKey = tenant.subdomain;

  if (tenantModelCache.has(cacheKey)) {
    return tenantModelCache.get(cacheKey);
  }

  const connection = getPlatformConnection();
  const models = registerTenantModels(connection, tenant.subdomain);
  const context = { connection, models };

  tenantModelCache.set(cacheKey, context);
  return context;
};

export const provisionTenantCollections = async (tenant) => {
  const { models } = await getTenantModelsForTenant(tenant);
  await Promise.all([
    models.User.createCollection(),
    models.Order.createCollection(),
  ]);
};

export const dropTenantCollections = async (subdomain) => {
  const connection = getPlatformConnection();
  const { users, orders } = getTenantCollections(subdomain);

  await Promise.allSettled([
    connection.dropCollection(users),
    connection.dropCollection(orders),
  ]);

  tenantModelCache.delete(subdomain);
};

export const clearTenantModelCache = () => {
  tenantModelCache.clear();
};

export const getTenantModelCacheCount = () => tenantModelCache.size;
