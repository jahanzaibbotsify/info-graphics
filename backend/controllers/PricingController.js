const Plan = require('../models/Plan');

class PricingController {
  static async getAllPlans(req, res) {
    try {
      const plans = await Plan.find({});
      // Sort by amount manually since local storage doesn't have built-in sort
      plans.sort((a, b) => a.amount - b.amount);
      res.json(plans);
    } catch (error) {
      console.error('Error fetching plans:', error);
      res.status(500).json({ error: 'Failed to fetch plans' });
    }
  }
}

module.exports = PricingController;
