# Quick Wins Security Guide - Step by Step

## Quick Win #1: Remove console.log from Production Code

### Step 1: Create a Logger Utility

Create a utility that only logs in development:

**File:** `lib/logger.ts`

```typescript
const isDevelopment = process.env.NODE_ENV === 'development';

export const logger = {
  log: (...args: any[]) => {
    if (isDevelopment) {
      console.log(...args);
    }
  },
  error: (...args: any[]) => {
    // Always log errors, but sanitize in production
    if (isDevelopment) {
      console.error(...args);
    } else {
      // In production, log to your logging service (Sentry, etc.)
      // For now, we'll still log errors but without sensitive data
      console.error(...args.map(arg => {
        if (typeof arg === 'string' && (arg.includes('password') || arg.includes('secret') || arg.includes('token'))) {
          return '[REDACTED]';
        }
        return arg;
      }));
    }
  },
  warn: (...args: any[]) => {
    if (isDevelopment) {
      console.warn(...args);
    }
  },
  info: (...args: any[]) => {
    if (isDevelopment) {
      console.info(...args);
    }
  },
};
```

### Step 2: Replace Critical console.log Statements

Focus on files that might log sensitive data:
- `app/api/webhooks/stripe/route.ts` - Payment data
- `app/api/survey/submit/route.ts` - User data
- `app/api/checkout/create-session/route.ts` - Payment data
- `app/api/user/profile/route.ts` - User data

**Example replacement:**
```typescript
// Before:
console.log('Webhook received at:', new Date().toISOString());

// After:
import { logger } from '@/lib/logger';
logger.log('Webhook received at:', new Date().toISOString());
```

### Step 3: Keep Error Logging (But Sanitize)

For `console.error`, we want to keep it but sanitize sensitive data:
```typescript
// Before:
console.error('Error:', error);

// After:
logger.error('Error:', error); // Will sanitize in production
```

---

## Quick Win #2: Add Basic Rate Limiting

### Step 1: Install Rate Limiting Package

```bash
npm install @upstash/ratelimit @upstash/redis
```

**OR** for a simpler in-memory solution (no external service needed):
```bash
npm install rate-limiter-flexible
```

### Step 2: Create Rate Limiter Utility

**File:** `lib/rate-limit.ts`

**Option A: Simple In-Memory (Easiest, Good for Start)**
```typescript
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
```

**Option B: Upstash Redis (Better for Production, Requires Upstash Account)**
```typescript
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

export const surveyRateLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, '60 s'),
});

export const checkoutRateLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(3, '60 s'),
});
```

### Step 3: Add Rate Limiting to Critical Endpoints

**Example: `app/api/survey/submit/route.ts`**
```typescript
import { checkRateLimit, surveyRateLimiter } from '@/lib/rate-limit';
import { getSession } from '@auth0/nextjs-auth0';

export async function POST(request: Request) {
  try {
    const session = await getSession();
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Add rate limiting
    const rateLimitResult = await checkRateLimit(
      surveyRateLimiter,
      session.user.sub // Use Auth0 ID as identifier
    );

    if (!rateLimitResult.success) {
      return NextResponse.json(
        {
          error: 'Too many requests. Please try again later.',
          retryAfter: Math.ceil((rateLimitResult.resetTime || 60000) / 1000),
        },
        { status: 429 }
      );
    }

    // ... rest of your code
  } catch (error) {
    // ...
  }
}
```

**Apply to these endpoints:**
- `/api/survey/submit` - 5 requests per minute
- `/api/checkout/create-session` - 3 requests per minute
- `/api/actions/complete` - 50 requests per minute
- `/api/referrals/track` - 10 requests per minute

---

## Quick Win #3: Add Input Validation with Zod

### Step 1: Install Zod

```bash
npm install zod
```

### Step 2: Create Validation Schemas

**File:** `lib/validations.ts`

```typescript
import { z } from 'zod';

// Survey response validation
export const surveyResponseSchema = z.object({
  userId: z.string().uuid().optional(),
  responses: z.array(
    z.object({
      questionId: z.number().int().positive(),
      answer: z.union([
        z.number().int().min(1).max(5), // Rating scale
        z.boolean(), // Yes/No questions
        z.string().min(1).max(1000), // Text responses
      ]),
    })
  ).min(1).max(30), // Reasonable limits
  skip: z.boolean().optional(),
});

// User profile update validation
export const userProfileUpdateSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  email: z.string().email().optional(),
  country: z.enum(['US', 'CA', 'Other']).optional(),
  has_kids: z.boolean().optional(),
  kids_live_with_you: z.boolean().optional(),
});

// Referral code validation
export const referralCodeSchema = z.object({
  referralCode: z.string().regex(/^[A-Z0-9]{8}$/, 'Invalid referral code format'),
});

// Action completion validation
export const actionCompleteSchema = z.object({
  actionId: z.string().uuid(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format'),
  completed: z.boolean().optional(),
  dnc: z.boolean().optional(), // Do not complete
});
```

### Step 3: Add Validation to API Routes

**Example: `app/api/survey/submit/route.ts`**
```typescript
import { surveyResponseSchema } from '@/lib/validations';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const session = await getSession();
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();

    // Validate input
    const validationResult = surveyResponseSchema.safeParse(body);
    
    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: 'Invalid request data',
          details: validationResult.error.errors,
        },
        { status: 400 }
      );
    }

    const { userId, responses, skip } = validationResult.data;

    // ... rest of your code using validated data
  } catch (error) {
    // ...
  }
}
```

**Example: `app/api/referrals/track/route.ts`**
```typescript
import { referralCodeSchema } from '@/lib/validations';

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();

    // Validate referral code
    const validationResult = referralCodeSchema.safeParse(body);
    
    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: 'Invalid referral code format',
          details: validationResult.error.errors,
        },
        { status: 400 }
      );
    }

    const { referralCode } = validationResult.data;
    // ... rest of your code
  } catch (error) {
    // ...
  }
}
```

---

## Implementation Order

1. **Start with Logger** (Easiest, 15 minutes)
   - Create `lib/logger.ts`
   - Replace console.log in 3-5 critical files
   - Test locally

2. **Add Rate Limiting** (Medium, 30 minutes)
   - Install package
   - Create rate limiter utility
   - Add to 2-3 critical endpoints
   - Test rate limiting works

3. **Add Input Validation** (Most time, 45 minutes)
   - Install zod
   - Create validation schemas
   - Add validation to 3-4 critical endpoints
   - Test with invalid inputs

## Testing Each Quick Win

### Test Logger:
```bash
# Development (should see logs)
NODE_ENV=development npm run dev

# Production (should NOT see logs)
NODE_ENV=production npm run build && npm start
```

### Test Rate Limiting:
```bash
# Make multiple rapid requests to /api/survey/submit
# Should get 429 error after limit exceeded
```

### Test Input Validation:
```bash
# Send invalid data to endpoints
# Should get 400 error with validation details
```

---

## Next Steps After Quick Wins

1. Gradually replace remaining console.log statements
2. Add rate limiting to more endpoints as needed
3. Expand validation schemas for all user inputs
4. Consider adding a proper logging service (Sentry, LogRocket)
5. Set up monitoring/alerts for rate limit violations

