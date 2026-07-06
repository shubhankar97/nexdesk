import dotenv from 'dotenv';
import { connectDatabase, getPlatformModels } from '../src/config/database.js';
import { BILLING_INTERVAL } from '../src/constants/subscription.js';

dotenv.config();

const seedPlans = [
  {
    name: 'Starter',
    slug: 'starter',
    description: 'For small teams getting started',
    price: 99900,
    currency: 'INR',
    interval: BILLING_INTERVAL.MONTHLY,
    trialDays: 14,
    features: ['Up to 5 users', 'Basic support', 'Certificate management'],
  },
  {
    name: 'Professional',
    slug: 'professional',
    description: 'For growing businesses',
    price: 299900,
    currency: 'INR',
    interval: BILLING_INTERVAL.MONTHLY,
    trialDays: 14,
    features: ['Up to 25 users', 'Priority support', 'Advanced reporting'],
  },
  {
    name: 'Enterprise',
    slug: 'enterprise',
    description: 'For large organizations',
    price: 999900,
    currency: 'INR',
    interval: BILLING_INTERVAL.YEARLY,
    trialDays: 30,
    features: ['Unlimited users', 'Dedicated support', 'Custom integrations'],
  },
];

const seed = async () => {
  await connectDatabase();
  const { Plan } = getPlatformModels();

  for (const planData of seedPlans) {
    const existing = await Plan.findOne({ slug: planData.slug });

    if (existing) {
      console.log(`Skipped plan: ${planData.slug} already exists (${existing.planId})`);
      continue;
    }

    const plan = await Plan.create(planData);
    console.log(`Created plan: ${plan.name} [${plan.planId}] — ${plan.price / 100} ${plan.currency}/${plan.interval}`);
  }

  process.exit(0);
};

seed().catch((error) => {
  console.error('Seed failed:', error);
  process.exit(1);
});
