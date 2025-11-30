import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@auth0/nextjs-auth0';
import { stripe, getStripePriceId } from '@/lib/stripe';
import { getSupabaseAdmin } from '@/lib/supabase';
import { logger } from '@/lib/logger';
import { checkRateLimit, checkoutRateLimiter } from '@/lib/rate-limit';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json(
        { error: 'Stripe is not configured' },
        { status: 500 }
      );
    }

    const session = await getSession();
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const auth0Id = session.user.sub;

    // Add rate limiting
    const rateLimitResult = await checkRateLimit(
      checkoutRateLimiter,
      auth0Id
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

    const body = await request.json().catch(() => ({}));
    const billingInterval = (body.interval as 'month' | 'year') || 'month';
    const skipTrial = body.skipTrial === true; // Allow skipping trial for direct subscription

    const adminSupabase = getSupabaseAdmin();

    // Get user from database (including trial info to check if already on trial)
    const { data: user, error: userError } = await adminSupabase
      .from('users')
      .select('id, email, name, stripe_customer_id, trial_ends_at, trial_started_at')
      .eq('auth0_id', auth0Id)
      .single();

    if (userError || !user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Get or create Stripe customer
    let customerId = user.stripe_customer_id;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email || session.user.email || undefined,
        name: user.name || session.user.name || undefined,
        metadata: {
          auth0_id: auth0Id,
          user_id: user.id,
        },
      });

      customerId = customer.id;

      // Save Stripe customer ID to database
      await adminSupabase
        .from('users')
        .update({ stripe_customer_id: customerId })
        .eq('id', user.id);
    }

    // Get the price ID for premium tier with the selected billing interval
    const priceId = getStripePriceId('premium', billingInterval);

    // Check if user is already on a trial
    const isOnTrial = user.trial_ends_at && user.trial_started_at;
    const trialEndDate = user.trial_ends_at ? new Date(user.trial_ends_at) : null;
    const now = new Date();
    const hasActiveTrial = isOnTrial && trialEndDate && trialEndDate > now;

    // If user is already on trial or explicitly skipping, don't add trial period
    // Stripe will handle continuing the existing trial until it ends, then billing begins
    const shouldSkipTrial = skipTrial || hasActiveTrial;

    // Create Stripe Checkout Session
    const checkoutSession = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      subscription_data: {
        ...(shouldSkipTrial ? {} : { trial_period_days: 7 }), // Only add trial if not skipping and not already on trial
        metadata: {
          user_id: user.id,
          auth0_id: auth0Id,
        },
      },
      success_url: `${request.nextUrl.origin}/dashboard/subscription?success=true`,
      cancel_url: `${request.nextUrl.origin}/dashboard/subscription?canceled=true`,
      metadata: {
        user_id: user.id,
        auth0_id: auth0Id,
      },
    });

    return NextResponse.json({
      sessionId: checkoutSession.id,
      url: checkoutSession.url,
    });
  } catch (error: any) {
    logger.error('Error creating checkout session:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}

