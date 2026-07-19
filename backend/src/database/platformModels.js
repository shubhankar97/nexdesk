import { masterUserSchema } from '../models/schemas/masterUser.schema.js';
import { planSchema } from '../models/Plan.js';
import { tenantSchema } from '../models/Tenant.js';
import { usageCounterSchema } from '../models/UsageCounter.js';

let platformModels = null;

export const registerPlatformModels = (connection) => {
  const Tenant = connection.models.Tenant || connection.model('Tenant', tenantSchema);
  const Plan = connection.models.Plan || connection.model('Plan', planSchema);
  const MasterUser =
    connection.models.MasterUser || connection.model('MasterUser', masterUserSchema);
  const UsageCounter =
    connection.models.UsageCounter || connection.model('UsageCounter', usageCounterSchema);

  platformModels = { Tenant, Plan, MasterUser, UsageCounter };
  return platformModels;
};

export const getPlatformModels = () => {
  if (!platformModels) {
    throw new Error('Platform models are not initialized');
  }

  return platformModels;
};
