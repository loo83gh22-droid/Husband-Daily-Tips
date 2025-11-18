/**
 * Example Stripe Checkout API Route
 * 
 * This is an example implementation for future payment integration.
 * To use this:
 * 
 * 1. Install Stripe: npm install stripe
 * 2. Create app/api/checkout/route.ts with this code
 * 3. Add STRIPE_SECRET_KEY to your environment variables
 * 4. Update the subscription page to call this endpoint
 */

/*
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getSession } from '@auth0/nextjs-auth0';
import { supabase } from '@/lib/supabase';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

export async function POST(req: NextRequest) {
  try {
    const session = await getSession(req);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { tier } = await req.json();
    
    if (!['premium', 'pro'].includes(tier)) {
      return NextResponse.json({ error: 'Invalid tier' }, { status: 400 });
    }

    // Get user from database
    const { data: user } = await supabase
      .from('users')
      .select('id, email')
      .eq('auth0_id', session.user.sub)
      .single();

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Create Stripe checkout session
    const checkoutSession = await stripe.checkout.sessions.create({
      customer_email: user.email,
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `${tier.charAt(0).toUpperCase() + tier.slice(1)} Plan`,
              description: 'Husband Daily Tips Subscription',
            },
            recurring: {
              interval: 'month',
            },
            unit_amount: tier === 'premium' ? 1999 : 2999, // $19.99 or $29.99
          },
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${process.env.AUTH0_BASE_URL}/dashboard/subscription?success=true`,
      cancel_url: `${process.env.AUTH0_BASE_URL}/dashboard/subscription?canceled=true`,
      metadata: {
        userId: user.id,
        tier: tier,
      },
    });

    return NextResponse.json({ url: checkoutSession.url });
  } catch (error: any) {
    console.error('Stripe checkout error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
*/


