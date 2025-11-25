import { RateLimiterMemory } from 'rate-limiter-flexible';

// Create rate limiters for different endpoints
export const surveyRateLimiter = new RateLimiterMemory({
  points: 5, // 5 requests
  duration: 60, // per 60 seconds
});

export const checkoutRateLimiter = new RateLimiterMemory({
  points: 3, // 3 requests
  duration: 60, // per 60 seconds
});

export const actionCompleteRateLimiter = new RateLimiterMemory({
  points: 50, // 50 requests
  duration: 60, // per 60 seconds
});

export const referralRateLimiter = new RateLimiterMemory({
  points: 10, // 10 requests
  duration: 60, // per 60 seconds
});

// Helper function to check rate limit
export async function checkRateLimit(
  rateLimiter: RateLimiterMemory,
  identifier: string
): Promise<{ success: boolean; remaining?: number; resetTime?: number }> {
  try {
    await rateLimiter.consume(identifier);
    return { success: true };
  } catch (rejRes: any) {
    return {
      success: false,
      remaining: rejRes.remainingPoints,
      resetTime: rejRes.msBeforeNext,
    };
  }
}

