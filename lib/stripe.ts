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
  premium: process.env.STRIPE_PRICE_ID_PREMIUM || 'price_premium_monthly', // $7/month
} as const;

// Get Stripe Price ID for a subscription tier
export function getStripePriceId(tier: 'premium'): string {
  return STRIPE_PRICE_IDS[tier];
}

// Stripe webhook secret for verifying webhook signatures
export const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET || '';

