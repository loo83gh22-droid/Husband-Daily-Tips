import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not set in environment variables');
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-12-18.acacia',
  typescript: true,
});

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

