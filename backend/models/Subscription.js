const localStorage = require('../utils/localStorage');

class Subscription {
  static async create(subscriptionData) {
    const subscription = localStorage.create('subscriptions', {
      user: subscriptionData.user, // user ID
      plan: subscriptionData.plan, // plan ID
      stripeSubscriptionId: subscriptionData.stripeSubscriptionId,
      status: subscriptionData.status || 'active',
      currentPeriodEnd: subscriptionData.currentPeriodEnd
    });
    
    return subscription;
  }

  static async findOne(query) {
    return localStorage.findOne('subscriptions', query);
  }

  static async findById(id) {
    return localStorage.findById('subscriptions', id);
  }

  static async find(query = {}) {
    return localStorage.find('subscriptions', query);
  }

  static async updateOne(query, update) {
    return localStorage.updateOne('subscriptions', query, update);
  }

  static async deleteOne(query) {
    return localStorage.deleteOne('subscriptions', query);
  }

  // Helper method to populate user and plan data
  static async findWithPopulate(query = {}) {
    const subscriptions = this.find(query);
    const User = require('./User');
    const Plan = require('./Plan');
    
    for (let subscription of subscriptions) {
      if (subscription.user) {
        subscription.user = await User.findById(subscription.user);
      }
      if (subscription.plan) {
        subscription.plan = await Plan.findById(subscription.plan);
      }
    }
    
    return subscriptions;
  }
}

module.exports = Subscription;
