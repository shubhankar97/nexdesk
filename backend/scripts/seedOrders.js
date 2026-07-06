import dotenv from 'dotenv';
import { connectDatabase } from '../src/config/database.js';
import { computeOrderStatus } from '../src/constants/order.js';
import { ROLES } from '../src/constants/roles.js';
import { runWithTenantContext } from '../src/context/tenantContext.js';
import { Order } from '../src/models/Order.js';
import { Tenant } from '../src/models/Tenant.js';
import { User } from '../src/models/User.js';

dotenv.config();

const daysFromNow = (days) => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  date.setHours(0, 0, 0, 0);
  return date;
};

const buildOrderSeed = (customerId, tenantId) => [
  {
    certificateName: 'SSL Certificate',
    issueDate: daysFromNow(-300),
    validity: daysFromNow(65),
    nextRenewal: daysFromNow(45),
    customer: customerId,
    tenantId,
    currentCertificate: {
      fileName: 'ssl-certificate.pem',
      fileUrl: 'https://example.com/certs/ssl-certificate.pem',
      uploadedAt: daysFromNow(-10),
    },
  },
  {
    certificateName: 'ISO 9001 Certification',
    issueDate: daysFromNow(-400),
    validity: daysFromNow(120),
    nextRenewal: daysFromNow(20),
    customer: customerId,
    tenantId,
    currentCertificate: {
      fileName: 'iso-9001-2025.pdf',
      fileUrl: 'https://example.com/certs/iso-9001-2025.pdf',
      uploadedAt: daysFromNow(-5),
    },
    certificateVersions: [
      {
        fileName: 'iso-9001-2024.pdf',
        fileUrl: 'https://example.com/certs/iso-9001-2024.pdf',
        uploadedAt: daysFromNow(-365),
      },
    ],
  },
  {
    certificateName: 'Fire Safety Certificate',
    issueDate: daysFromNow(-730),
    validity: daysFromNow(-45),
    nextRenewal: daysFromNow(-90),
    customer: customerId,
    tenantId,
  },
  {
    certificateName: 'GDPR Compliance Certificate',
    issueDate: daysFromNow(-180),
    validity: daysFromNow(545),
    nextRenewal: daysFromNow(300),
    customer: customerId,
    tenantId,
    currentCertificate: {
      fileName: 'gdpr-compliance.pdf',
      fileUrl: 'https://example.com/certs/gdpr-compliance.pdf',
      uploadedAt: daysFromNow(-30),
    },
  },
  {
    certificateName: 'Trade License',
    issueDate: daysFromNow(-60),
    validity: daysFromNow(305),
    nextRenewal: daysFromNow(14),
    customer: customerId,
    tenantId,
  },
];

const seedTenantOrders = async (tenant) => {
  const customer = await User.findOne({
    tenantId: tenant.tenantId,
    role: ROLES.CUSTOMER,
    isActive: true,
  });

  if (!customer) {
    console.log(`Skipped ${tenant.subdomain}: no customer user found`);
    return;
  }

  const orders = buildOrderSeed(customer._id, tenant.tenantId);

  for (const orderData of orders) {
    const existing = await Order.findOne({
      tenantId: tenant.tenantId,
      certificateName: orderData.certificateName,
    });

    if (existing) {
      console.log(`Skipped order: ${orderData.certificateName} (${tenant.subdomain})`);
      continue;
    }

    const status = computeOrderStatus(orderData.validity, orderData.nextRenewal);

    await Order.create({
      ...orderData,
      status,
    });

    console.log(`Created order: ${orderData.certificateName} [${status}] (${tenant.subdomain})`);
  }
};

const seed = async () => {
  await connectDatabase();

  const tenants = await Tenant.find({ subdomain: { $in: ['abc', 'xyz'] } });

  if (tenants.length === 0) {
    console.error('No tenants found. Run npm run seed:tenants first.');
    process.exit(1);
  }

  for (const tenant of tenants) {
    await runWithTenantContext({ tenant, tenantId: tenant.tenantId }, () =>
      seedTenantOrders(tenant)
    );
  }

  process.exit(0);
};

seed().catch((error) => {
  console.error('Seed failed:', error);
  process.exit(1);
});
