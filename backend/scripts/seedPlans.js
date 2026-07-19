import dotenv from 'dotenv';
import { connectDatabase, getPlatformModels } from '../src/config/database.js';
import { BILLING_INTERVAL } from '../src/constants/subscription.js';
import { MODULES } from '../src/constants/modules.js';

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
    limits: {
      documentAi: {
        uploadsPerMonth: 0,
      },
    },
  },
  {
    name: 'Professional',
    slug: 'professional',
    description: 'For growing businesses',
    price: 299900,
    currency: 'INR',
    interval: BILLING_INTERVAL.MONTHLY,
    trialDays: 14,
    features: [
      'Up to 25 users',
      'Priority support',
      'Advanced reporting',
      MODULES.DOCUMENT_AI,
    ],
    limits: {
      documentAi: {
        uploadsPerMonth: 100,
      },
    },
  },
  {
    name: 'Enterprise',
    slug: 'enterprise',
    description: 'For large organizations',
    price: 999900,
    currency: 'INR',
    interval: BILLING_INTERVAL.YEARLY,
    trialDays: 30,
    features: [
      'Unlimited users',
      'Dedicated support',
      'Custom integrations',
      MODULES.DOCUMENT_AI,
    ],
    limits: {
      documentAi: {
        uploadsPerMonth: null,
      },
    },
  },
];

const seed = async () => {
  await connectDatabase();
  const { Plan } = getPlatformModels();

  for (const planData of seedPlans) {
    const existing = await Plan.findOne({ slug: planData.slug });

    if (existing) {
      existing.features = planData.features;
      existing.limits = planData.limits;
      await existing.save();
      console.log(`Updated plan: ${planData.slug} features/limits`);
      continue;
    }

    const plan = await Plan.create(planData);
    console.log(
      `Created plan: ${plan.name} [${plan.planId}] — ${plan.price / 100} ${plan.currency}/${plan.interval}`
    );
  }

  process.exit(0);
};

seed().catch((error) => {
  console.error('Seed failed:', error);
  process.exit(1);
});
