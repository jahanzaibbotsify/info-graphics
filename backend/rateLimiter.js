const storage = require('./utils/localStorage');

// Store user generation counts with timestamps
const userGenerationCounts = new Map();

// Reset counts every 24 hours for free users
setInterval(() => {
  const now = Date.now();
  const twentyFourHoursAgo = now - (24 * 60 * 60 * 1000);
  
  // Clean up old entries for free users
  for (const [userId, data] of userGenerationCounts.entries()) {
    if (data.resetTime && data.resetTime < twentyFourHoursAgo && !data.isPaid) {
      userGenerationCounts.delete(userId);
    }
  }
}, 60 * 60 * 1000); // Check every hour

const rateLimiter = async (req, res, next) => {
  try {
    // Require authentication for infographic generation
    if (!req.user) {
      return res.status(401).json({
        error: 'Authentication required',
        message: 'You must be logged in to create infographics. Please sign up or log in to continue.',
        code: 'AUTH_REQUIRED'
      });
    }

    const userId = req.user._id.toString();
    
    // Skip rate limiting for users with active paid subscription
    if (req.user.subscription && req.user.subscription.status === 'active') {
      return next();
    }

    // Get current count and reset time for this user
    const userData = userGenerationCounts.get(userId) || { 
      count: 0, 
      resetTime: Date.now(),
      isPaid: false 
    };

    // Check if we need to reset the count (24 hours have passed)
    const now = Date.now();
    const twentyFourHoursAgo = now - (24 * 60 * 60 * 1000);
    
    if (userData.resetTime < twentyFourHoursAgo) {
      userData.count = 0;
      userData.resetTime = now;
    }

    // Get the user's plan limit (default to 5 for free users)
    const limit = req.user.subscription?.plan?.animations_allowed || 5;

    // Check if user has exceeded their plan limit
    if (userData.count >= limit) {
      const timeUntilReset = Math.ceil((userData.resetTime + (24 * 60 * 60 * 1000) - now) / (60 * 60 * 1000));
      
      return res.status(429).json({
        error: 'Generation limit reached',
        message: `You have reached your limit of ${limit} infographics per day. ${
          limit === 5 
            ? 'Upgrade to Pro for unlimited infographics!' 
            : `Your limit will reset in ${timeUntilReset} hours.`
        }`,
        code: 'RATE_LIMIT_EXCEEDED',
        limit: limit,
        used: userData.count,
        resetIn: timeUntilReset
      });
    }

    // Increment count for this user
    userData.count += 1;
    userGenerationCounts.set(userId, userData);

    // Add rate limit info to response headers
    res.set({
      'X-RateLimit-Limit': limit,
      'X-RateLimit-Remaining': Math.max(0, limit - userData.count),
      'X-RateLimit-Reset': userData.resetTime + (24 * 60 * 60 * 1000)
    });

    next();
  } catch (error) {
    console.error('Rate limiter error:', error);
    next(error);
  }
};

module.exports = rateLimiter; 