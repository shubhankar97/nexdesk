import dotenv from 'dotenv';
import { connectDatabase } from '../src/config/database.js';
import { Tenant } from '../src/models/Tenant.js';

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

const seed = async () => {
  await connectDatabase();

  for (const tenantData of seedTenants) {
    const existing = await Tenant.findOne({ subdomain: tenantData.subdomain });

    if (existing) {
      console.log(`Skipped tenant: ${tenantData.subdomain} already exists (${existing.tenantId})`);
      continue;
    }

    const tenant = await Tenant.create(tenantData);
    console.log(
      `Created tenant: ${tenant.subdomain}.coregent.com (${tenant.companyName}) [${tenant.tenantId}]`
    );
  }

  process.exit(0);
};

seed().catch((error) => {
  console.error('Seed failed:', error);
  process.exit(1);
});
