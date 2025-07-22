const storage = require('./utils/localStorage');

// Store user generation counts (lifetime totals for free users)
const userGenerationCounts = new Map();

// Clean up very old entries to prevent memory leaks (keep entries for 30 days)
setInterval(() => {
  const now = Date.now();
  const thirtyDaysAgo = now - (30 * 24 * 60 * 60 * 1000);
  
  // Only remove very old entries to prevent memory leaks
  for (const [userId, data] of userGenerationCounts.entries()) {
    if (data.lastActivity && data.lastActivity < thirtyDaysAgo) {
      userGenerationCounts.delete(userId);
    }
  }
}, 24 * 60 * 60 * 1000); // Check every 24 hours

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

    // Get current count for this user (lifetime total for free users)
    const userData = userGenerationCounts.get(userId) || { 
      count: 0, 
      lastActivity: Date.now(),
      isPaid: false 
    };

    // Update last activity
    userData.lastActivity = Date.now();

    // Get the user's plan limit (default to 2 for free users)
    const limit = req.user.subscription?.plan?.animations_allowed || 2;

    // Check if user has exceeded their lifetime limit
    if (userData.count >= limit) {
      return res.status(429).json({
        error: 'Generation limit reached',
        message: `You have reached your lifetime limit of ${limit} infographics. Upgrade to Pro for unlimited infographics and advanced features!`,
        code: 'LIFETIME_LIMIT_EXCEEDED',
        limit: limit,
        used: userData.count,
        isLifetimeLimit: true
      });
    }

    // Increment count for this user
    userData.count += 1;
    userGenerationCounts.set(userId, userData);

    // Add rate limit info to response headers
    res.set({
      'X-RateLimit-Limit': limit,
      'X-RateLimit-Remaining': Math.max(0, limit - userData.count),
      'X-RateLimit-Type': 'lifetime'
    });

    next();
  } catch (error) {
    console.error('Rate limiter error:', error);
    next(error);
  }
};

module.exports = rateLimiter; 