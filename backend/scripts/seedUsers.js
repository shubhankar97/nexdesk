import dotenv from 'dotenv';
import { connectDatabase, getPlatformModels } from '../src/config/database.js';
import { env } from '../src/config/env.js';
import { ROLES } from '../src/constants/roles.js';
import { runWithTenantContext } from '../src/context/tenantContext.js';
import { getTenantModelsForTenant } from '../src/database/tenantConnection.js';
import { getTenantHost } from '../src/utils/subdomain.js';

dotenv.config();

const seed = async () => {
  await connectDatabase();
  const { MasterUser, Tenant } = getPlatformModels();

  const masterEmail = process.env.SEED_MASTER_EMAIL || 'master@worzest.com';
  const existingMaster = await MasterUser.findOne({ email: masterEmail });

  if (existingMaster) {
    console.log(`Skipped ${ROLES.MASTER}: ${masterEmail} already exists`);
  } else {
    await MasterUser.create({
      email: masterEmail,
      password: process.env.SEED_MASTER_PASSWORD || 'Master123!',
      role: ROLES.MASTER,
    });
    console.log(`Created ${ROLES.MASTER}: ${masterEmail}`);
  }

  const tenants = await Tenant.find({ subdomain: { $in: ['abc', 'xyz'] } });

  if (tenants.length === 0) {
    console.error('No tenants found. Run npm run seed:tenants first.');
    process.exit(1);
  }

  for (const tenant of tenants) {
    const { connection, models } = await getTenantModelsForTenant(tenant);
    const tenantHost = getTenantHost(tenant.subdomain, env.rootDomain, env.appSubdomain);
    const adminEmail = `admin@${tenantHost}`;

    await runWithTenantContext(
      { tenant, tenantId: tenant.tenantId, connection, models },
      async () => {
        const existingAdmin = await models.User.findOne({ email: adminEmail });

        if (existingAdmin) {
          console.log(`Skipped ${ROLES.ADMIN}: ${adminEmail} already exists`);
        } else {
          await models.User.create({
            email: adminEmail,
            password: process.env.SEED_ADMIN_PASSWORD || 'Admin123!',
            role: ROLES.ADMIN,
          });
          console.log(`Created ${ROLES.ADMIN} for ${tenant.subdomain}: ${adminEmail}`);
        }

        const customerSeeds = [
          { email: `customer@${tenantHost}` },
          { email: `alice@${tenantHost}` },
          { email: `bob@${tenantHost}` },
        ];

        for (const { email } of customerSeeds) {
          const existingCustomer = await models.User.findOne({ email });

          if (existingCustomer) {
            console.log(`Skipped ${ROLES.CUSTOMER}: ${email} already exists`);
            continue;
          }

          await models.User.create({
            email,
            password: process.env.SEED_CUSTOMER_PASSWORD || 'Customer123!',
            role: ROLES.CUSTOMER,
          });
          console.log(`Created ${ROLES.CUSTOMER} for ${tenant.subdomain}: ${email}`);
        }
      }
    );
  }

  process.exit(0);
};

seed().catch((error) => {
  console.error('Seed failed:', error);
  process.exit(1);
});
