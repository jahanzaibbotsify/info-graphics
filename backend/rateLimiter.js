const storage = require('./utils/localStorage');

// Store user generation counts
const userGenerationCounts = new Map();

// Reset counts every 24 hours
setInterval(() => {
  userGenerationCounts.clear();
}, 24 * 60 * 60 * 1000);

const rateLimiter = async (req, res, next) => {
  try {
    // Skip rate limiting for authenticated users with active subscription
    if (req.user && req.user.subscription && req.user.subscription.status === 'active') {
      return next();
    }

    // Get user identifier (IP for non-logged in users, user ID for logged in users)
    const userId = req.user ? req.user._id : req.ip;
    
    // Get current count for this user
    const currentCount = userGenerationCounts.get(userId) || 0;

    // Check if user has exceeded free tier limit
    if (currentCount >= 2) {
      return res.status(429).json({
        error: 'Free tier limit reached',
        message: 'You have reached your free tier limit of 2 infographics. Please subscribe to create more.',
        code: 'FREE_TIER_LIMIT'
      });
    }

    // Increment count for this user
    userGenerationCounts.set(userId, currentCount + 1);

    next();
  } catch (error) {
    console.error('Rate limiter error:', error);
    next(error);
  }
};

module.exports = rateLimiter; 