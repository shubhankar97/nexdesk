import dotenv from 'dotenv';
import { connectDatabase, getPlatformModels } from '../src/config/database.js';
import { provisionTenantCollections } from '../src/database/tenantConnection.js';
import { env } from '../src/config/env.js';
import { SUBSCRIPTION_STATUS } from '../src/constants/subscription.js';
import { getTenantCollections } from '../src/utils/tenantCollections.js';
import { getTenantHost } from '../src/utils/subdomain.js';

dotenv.config();

const seedTenants = [
  {
    companyName: 'ABC Corporation',
    subdomain: 'abc',
  },
  {
    companyName: 'XYZ Industries',
    subdomain: 'xyz',
  },
];

const addYear = (date) => new Date(date.getTime() + 365 * 24 * 60 * 60 * 1000);

const seed = async () => {
  await connectDatabase();
  const { Plan, Tenant } = getPlatformModels();

  const starterPlan = await Plan.findOne({ slug: 'starter', isActive: true });

  if (!starterPlan) {
    console.error('Starter plan not found. Run npm run seed:plans first.');
    process.exit(1);
  }

  const now = new Date();

  for (const tenantData of seedTenants) {
    const existing = await Tenant.findOne({ subdomain: tenantData.subdomain });

    if (existing) {
      await provisionTenantCollections(existing);
      const collections = getTenantCollections(existing.subdomain);
      console.log(`Provisioned tenant collections: ${collections.users}, ${collections.orders}`);

      if (!existing.planId) {
        existing.planId = starterPlan.planId;
        existing.subscriptionStatus = SUBSCRIPTION_STATUS.ACTIVE;
        existing.currentPeriodStart = now;
        existing.currentPeriodEnd = addYear(now);
        await existing.save();
        console.log(`Updated tenant subscription: ${tenantData.subdomain}`);
      } else {
        console.log(`Skipped tenant: ${tenantData.subdomain} already exists (${existing.tenantId})`);
      }
      continue;
    }

    const tenant = await Tenant.create({
      ...tenantData,
      planId: starterPlan.planId,
      subscriptionStatus: SUBSCRIPTION_STATUS.ACTIVE,
      currentPeriodStart: now,
      currentPeriodEnd: addYear(now),
    });

    await provisionTenantCollections(tenant);
    const collections = getTenantCollections(tenant.subdomain);

    console.log(
      `Created tenant: ${getTenantHost(tenant.subdomain, env.rootDomain, env.appSubdomain)} (${tenant.companyName}) [${tenant.tenantId}] → nexdesk.${collections.users}, nexdesk.${collections.orders}`
    );
  }

  process.exit(0);
};

seed().catch((error) => {
  console.error('Seed failed:', error);
  process.exit(1);
});
