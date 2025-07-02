const Plan = require('../models/Plan');

async function seedPlans() {
  try {
    // Check if plans already exist
    const existingPlans = await Plan.find();
    if (existingPlans.length > 0) {
      console.log('Plans already exist, skipping seeding');
      return;
    }

    const plans = [
      {
        name: 'Free',
        description: 'Free plan with limited animations',
        pricing_id: 'free',
        animations_allowed: 5,
        amount: 0,
        is_unlimited: false
      },
      {
        name: 'Pro',
        description: 'Pro plan with unlimited animations',
        pricing_id: 'pro_monthly',
        animations_allowed: null,
        amount: 9.99,
        is_unlimited: true
      }
    ];

    for (const planData of plans) {
      await Plan.create(planData);
      console.log(`✅ Created plan: ${planData.name}`);
    }

    console.log('✅ Plans seeded successfully!');
  } catch (error) {
    console.error('❌ Error seeding plans:', error);
  }
}

module.exports = seedPlans;

// Run seeder if called directly
if (require.main === module) {
  seedPlans();
}
