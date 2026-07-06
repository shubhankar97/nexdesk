import dotenv from 'dotenv';
import { connectDatabase } from '../src/config/database.js';
import { env } from '../src/config/env.js';
import { SUBSCRIPTION_STATUS } from '../src/constants/subscription.js';
import { Plan } from '../src/models/Plan.js';
import { Tenant } from '../src/models/Tenant.js';
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

  const starterPlan = await Plan.findOne({ slug: 'starter', isActive: true });

  if (!starterPlan) {
    console.error('Starter plan not found. Run npm run seed:plans first.');
    process.exit(1);
  }

  const now = new Date();

  for (const tenantData of seedTenants) {
    const existing = await Tenant.findOne({ subdomain: tenantData.subdomain });

    if (existing) {
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

    console.log(
      `Created tenant: ${getTenantHost(tenant.subdomain, env.rootDomain, env.appSubdomain)} (${tenant.companyName}) [${tenant.tenantId}]`
    );
  }

  process.exit(0);
};

seed().catch((error) => {
  console.error('Seed failed:', error);
  process.exit(1);
});
