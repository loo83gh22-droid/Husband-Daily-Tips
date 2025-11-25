import Stripe from 'stripe';

// Initialize Stripe - allow it to be undefined during build time
// It will be checked at runtime in API routes
const stripeSecretKey = process.env.STRIPE_SECRET_KEY || '';

export const stripe = stripeSecretKey
  ? new Stripe(stripeSecretKey, {
      apiVersion: '2025-11-17.clover',
    })
  : (null as unknown as Stripe);

// Stripe Price IDs - These need to be created in your Stripe Dashboard
// For now, we'll use environment variables so you can set them after creating products in Stripe
export const STRIPE_PRICE_IDS = {
  premium_monthly: process.env.STRIPE_PRICE_ID_PREMIUM_MONTHLY || 'price_premium_monthly', // $7/month
  premium_annual: process.env.STRIPE_PRICE_ID_PREMIUM_ANNUAL || 'price_premium_annual', // $71.40/year (15% discount)
} as const;

// Get Stripe Price ID for a subscription tier and billing interval
export function getStripePriceId(tier: 'premium', interval: 'month' | 'year' = 'month'): string {
  if (interval === 'year') {
    return STRIPE_PRICE_IDS.premium_annual;
  }
  return STRIPE_PRICE_IDS.premium_monthly;
}

// Stripe webhook secret for verifying webhook signatures
export const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET || '';

