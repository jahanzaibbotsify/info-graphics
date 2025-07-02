const localStorage = require('../utils/localStorage');

class Plan {
  static async create(planData) {
    const plan = localStorage.create('plans', {
      name: planData.name,
      description: planData.description,
      pricing_id: planData.pricing_id,
      animations_allowed: planData.animations_allowed || null,
      amount: planData.amount,
      is_unlimited: planData.is_unlimited || false
    });
    
    return plan;
  }

  static async findOne(query) {
    return localStorage.findOne('plans', query);
  }

  static async findById(id) {
    return localStorage.findById('plans', id);
  }

  static async find(query = {}) {
    return localStorage.find('plans', query);
  }

  static async updateOne(query, update) {
    return localStorage.updateOne('plans', query, update);
  }

  static async deleteOne(query) {
    return localStorage.deleteOne('plans', query);
  }
}

module.exports = Plan;
