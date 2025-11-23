# Stripe Integration Setup Guide

## ✅ What's Been Implemented

1. **Database Migration** (`037_add_stripe_fields.sql`)
   - Added Stripe customer ID, subscription ID, and status fields to `users` table
   - Created `subscriptions` table for subscription tracking
   - Created `payment_history` table for invoice tracking

2. **Stripe Packages Installed**
   - `stripe` - Server-side Stripe SDK
   - `@stripe/stripe-js` - Client-side Stripe SDK (for future use)

3. **API Routes Created**
   - `/api/checkout/create-session` - Creates Stripe Checkout sessions
   - `/api/webhooks/stripe` - Handles Stripe webhook events
   - `/api/customer-portal` - Creates Stripe Customer Portal sessions

4. **Components Created**
   - `SubscriptionButton` - Triggers Stripe Checkout
   - `CustomerPortalButton` - Opens Stripe Customer Portal

5. **Pages Updated**
   - Subscription page now uses real Stripe checkout
   - Payments page now has customer portal access

## 🔧 Setup Steps

### 1. Create Stripe Account

1. Go to [stripe.com](https://stripe.com) and create an account
2. Complete your business information
3. Get your API keys from the [Stripe Dashboard](https://dashboard.stripe.com/apikeys)

### 2. Create Product and Price in Stripe

1. Go to **Products** in Stripe Dashboard
2. Click **Add Product**
3. Set up your product:
   - **Name**: "Best Husband Ever Premium"
   - **Description**: "Daily relationship actions and tools"
   - **Pricing**: 
     - **Recurring**: Monthly
     - **Price**: $7.00 USD
   - Click **Save product**

4. **Copy the Price ID** (starts with `price_...`) - you'll need this!

### 3. Set Up Environment Variables

Add these to your `.env.local` file and Vercel environment variables:

```bash
# Stripe API Keys (from Stripe Dashboard > API Keys)
STRIPE_SECRET_KEY=sk_test_... # Test key for development
STRIPE_PUBLISHABLE_KEY=pk_test_... # Not used yet, but good to have

# Stripe Price ID (from the product you just created)
STRIPE_PRICE_ID_PREMIUM=price_... # The Price ID you copied

# Stripe Webhook Secret (see step 4)
STRIPE_WEBHOOK_SECRET=whsec_...
```

### 4. Set Up Stripe Webhooks

#### For Local Development (using Stripe CLI):

1. Install Stripe CLI: https://stripe.com/docs/stripe-cli
2. Login: `stripe login`
3. Forward webhooks to local server:
   ```bash
   stripe listen --forward-to localhost:3000/api/webhooks/stripe
   ```
4. Copy the webhook signing secret (starts with `whsec_...`) and add it to `.env.local`

#### For Production (Vercel):

1. Go to **Developers > Webhooks** in Stripe Dashboard
2. Click **Add endpoint**
3. Set endpoint URL: `https://yourdomain.com/api/webhooks/stripe`
4. Select events to listen for:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.paid`
   - `invoice.payment_failed`
5. Click **Add endpoint**
6. Copy the **Signing secret** (starts with `whsec_...`) and add it to Vercel environment variables

### 5. Run Database Migration

Run the migration to add Stripe fields to your database:

```bash
# If using Supabase CLI
supabase migration up

# Or run the SQL file directly in Supabase Dashboard > SQL Editor
```

### 6. Test the Integration

1. **Test Checkout Flow**:
   - Go to `/dashboard/subscription`
   - Click "Start Free Trial" on the Premium plan
   - You should be redirected to Stripe Checkout
   - Use test card: `4242 4242 4242 4242`
   - Any future expiry date, any CVC
   - Complete checkout

2. **Verify Webhook**:
   - Check your Stripe Dashboard > Webhooks for successful events
   - Check your database - user should have `subscription_tier = 'premium'`
   - Check `subscriptions` table for new record

3. **Test Customer Portal**:
   - Go to `/dashboard/payments`
   - Click "Manage Billing & Subscription"
   - You should be redirected to Stripe Customer Portal
   - You can cancel, update payment method, etc.

## 📋 Webhook Events Handled

- `checkout.session.completed` - When user completes checkout
- `customer.subscription.updated` - When subscription changes
- `customer.subscription.deleted` - When subscription is canceled
- `invoice.paid` - When payment succeeds
- `invoice.payment_failed` - When payment fails

## 🔒 Security Notes

- Webhook signatures are verified to ensure requests come from Stripe
- All database operations use admin client to bypass RLS
- Customer IDs are stored securely in the database
- Never expose your `STRIPE_SECRET_KEY` in client-side code

## 🧪 Test Cards

Use these test cards in Stripe test mode:

- **Success**: `4242 4242 4242 4242`
- **Decline**: `4000 0000 0000 0002`
- **Requires Authentication**: `4000 0025 0000 3155`

## 🚀 Going Live

1. Switch to **Live mode** in Stripe Dashboard
2. Get your **live API keys** (replace test keys)
3. Create the product/price in **live mode**
4. Update webhook endpoint to production URL
5. Get the **live webhook secret**
6. Update all environment variables in Vercel

## 📝 Next Steps

- [ ] Create Stripe account
- [ ] Create product and price
- [ ] Set environment variables
- [ ] Set up webhooks
- [ ] Run database migration
- [ ] Test checkout flow
- [ ] Test customer portal
- [ ] Switch to live mode when ready

## 🆘 Troubleshooting

**Checkout not working?**
- Verify `STRIPE_SECRET_KEY` is set correctly
- Verify `STRIPE_PRICE_ID_PREMIUM` matches your Stripe price ID
- Check browser console for errors
- Check server logs for API errors

**Webhooks not working?**
- Verify `STRIPE_WEBHOOK_SECRET` is set correctly
- Check Stripe Dashboard > Webhooks for failed events
- Verify webhook endpoint URL is correct
- For local dev, make sure Stripe CLI is running

**Subscription not updating?**
- Check webhook events in Stripe Dashboard
- Verify webhook handler is receiving events
- Check database for updated records
- Verify user has `stripe_customer_id` set

