const User = require('./models/User');
const Subscription = require('./models/Subscription');

// Rate limiting store for non-logged in users
const rateLimitStore = new Map();

// Rate limiting middleware - Currently disabled to allow unlimited generations
const rateLimiter = async (req, res, next) => {
  try {
    // Rate limiting temporarily disabled - allow all requests through
    console.log('Rate limiter: Allowing request (no limits enforced)');
    next();
  } catch (error) {
    console.error('Rate limiter error:', error);
    next(error);
  }
};

module.exports = { rateLimiter }; 