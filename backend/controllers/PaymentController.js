const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const User = require('../models/User');
const Plan = require('../models/Plan');
const Subscription = require('../models/Subscription');

class PaymentController {
  static async createCheckoutSession(req, res) {
    try {
      const plan = req.body.planId;
      const userId = req.user.id; // From auth middleware

      // Get user and plan
      const user = await User.findById(userId);

      if (!user || !plan) {
        return res.status(404).json({ error: 'User or plan not found' });
      }

      // Create Stripe checkout session
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
          {
            price: plan,
            quantity: 1,
          },
        ],
        mode: 'subscription',
        success_url: `${process.env.FRONTEND_URL}?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.FRONTEND_URL}/pricing`,
        customer_email: user.email,
        metadata: {
          userId: userId,
          planId: plan
        }
      });

      res.json({ url: session.url });
    } catch (err) {
      console.error('Checkout session error:', err);
      res.status(500).json({ error: 'Failed to create checkout session' });
    }
  }

  static async handleWebhook(req, res) {
    console.log('Webhook received');
    console.log(req.body, req.headers);
    const sig = req.headers['stripe-signature'];
    let event;

    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET
      );
    } catch (err) {
      console.error('Webhook signature verification failed:', err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    try {
      // Handle the event
      switch (event.type) {
        case 'checkout.session.completed': {
          const session = event.data.object;
          
          // Get user and plan
          const user = await User.findById(session.metadata.userId);
          const plan = await Plan.findOne({ pricing_id: session.metadata.planId });

          if (!user || !plan) {
            throw new Error('User or plan not found');
          }

          // Update user's allowed_animations based on plan
          const allowed_animations = plan.is_unlimited ? 2500 : plan.animations_allowed;
          await User.updateOne(
            { _id: user._id }, 
            {
              allowed_animations,
              stripe_id: session.customer
            }
          );

          // Create subscription record
          await Subscription.create({
            user: session.metadata.userId,
            plan: plan._id,
            stripeSubscriptionId: session.subscription,
            currentPeriodEnd: new Date(session.expires_at * 1000)
          });

          break;
        }
        case 'customer.subscription.updated':
        case 'customer.subscription.deleted': {
          const subscription = event.data.object;
          
          // Update subscription status in database
          await Subscription.updateOne(
            { stripeSubscriptionId: subscription.id },
            { 
              status: subscription.status,
              currentPeriodEnd: new Date(subscription.current_period_end * 1000)
            }
          );

          // If subscription is canceled or past due, reset allowed_animations to 0
          if (subscription.status === 'canceled' || subscription.status === 'past_due') {
            const sub = await Subscription.findOne({ stripeSubscriptionId: subscription.id });
            if (sub) {
              await User.updateOne({ _id: sub.user }, { allowed_animations: 0 });
            }
          }
          break;
        }
      }

      res.json({ received: true });
    } catch (err) {
      console.error('Webhook processing error:', err);
      res.status(500).json({ error: 'Webhook processing failed' });
    }
  }
}

module.exports = PaymentController;
