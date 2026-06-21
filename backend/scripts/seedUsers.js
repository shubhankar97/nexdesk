import dotenv from 'dotenv';
import { connectDatabase } from '../src/config/database.js';
import { ROLES } from '../src/constants/roles.js';
import { Tenant } from '../src/models/Tenant.js';
import { User } from '../src/models/User.js';

dotenv.config();

const seed = async () => {
  await connectDatabase();

  const masterEmail = process.env.SEED_MASTER_EMAIL || 'master@nexdesk.com';
  const existingMaster = await User.findOne({ email: masterEmail, role: ROLES.MASTER });

  if (existingMaster) {
    console.log(`Skipped ${ROLES.MASTER}: ${masterEmail} already exists`);
  } else {
    await User.create({
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
    const adminEmail = `admin@${tenant.subdomain}.coregent.com`;
    const customerEmail = `customer@${tenant.subdomain}.coregent.com`;

    const existingAdmin = await User.findOne({ email: adminEmail, tenantId: tenant.tenantId });

    if (existingAdmin) {
      console.log(`Skipped ${ROLES.ADMIN}: ${adminEmail} already exists`);
    } else {
      await User.create({
        email: adminEmail,
        password: process.env.SEED_ADMIN_PASSWORD || 'Admin123!',
        role: ROLES.ADMIN,
        tenantId: tenant.tenantId,
      });
      console.log(`Created ${ROLES.ADMIN} for ${tenant.subdomain}: ${adminEmail}`);
    }

    const existingCustomer = await User.findOne({
      email: customerEmail,
      tenantId: tenant.tenantId,
    });

    if (existingCustomer) {
      console.log(`Skipped ${ROLES.CUSTOMER}: ${customerEmail} already exists`);
    } else {
      await User.create({
        email: customerEmail,
        password: process.env.SEED_CUSTOMER_PASSWORD || 'Customer123!',
        role: ROLES.CUSTOMER,
        tenantId: tenant.tenantId,
      });
      console.log(`Created ${ROLES.CUSTOMER} for ${tenant.subdomain}: ${customerEmail}`);
    }
  }

  process.exit(0);
};

seed().catch((error) => {
  console.error('Seed failed:', error);
  process.exit(1);
});
