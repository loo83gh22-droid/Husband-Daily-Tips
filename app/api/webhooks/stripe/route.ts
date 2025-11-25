import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { stripe, STRIPE_WEBHOOK_SECRET } from '@/lib/stripe';
import { getSupabaseAdmin } from '@/lib/supabase';
import Stripe from 'stripe';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  // Log that we received the request
  console.log('Webhook received at:', new Date().toISOString());
  
  if (!process.env.STRIPE_SECRET_KEY || !stripe) {
    console.error('Stripe not configured');
    return NextResponse.json(
      { error: 'Stripe is not configured' },
      { status: 500 }
    );
  }

  const body = await request.text();
  const headersList = await headers();
  const signature = headersList.get('stripe-signature');
  
  console.log('Webhook signature present:', !!signature);

  if (!signature || !STRIPE_WEBHOOK_SECRET) {
    console.error('Missing Stripe signature or webhook secret');
    return NextResponse.json(
      { error: 'Missing signature or webhook secret' },
      { status: 400 }
    );
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      STRIPE_WEBHOOK_SECRET
    );
    console.log('Webhook event verified:', event.type);
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message);
    return NextResponse.json(
      { error: `Webhook Error: ${err.message}` },
      { status: 400 }
    );
  }

  const adminSupabase = getSupabaseAdmin();

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const customerId = session.customer as string;
        const subscriptionId = session.subscription as string;
        const userId = session.metadata?.user_id;

        if (!subscriptionId || typeof subscriptionId !== 'string') {
          console.error('Invalid subscription ID in checkout session');
          break;
        }

        if (!userId) {
          console.error('No user ID in checkout session metadata');
          break;
        }

        // Get subscription details
        const subscription = await stripe.subscriptions.retrieve(subscriptionId);

        // Extract subscription properties with type safety
        const currentPeriodEnd = (subscription as any).current_period_end as number | undefined;
        const currentPeriodStart = (subscription as any).current_period_start as number | undefined;
        const trialEnd = (subscription as any).trial_end as number | undefined;
        const cancelAtPeriodEnd = (subscription as any).cancel_at_period_end as boolean | undefined;

        // Update user subscription
        await adminSupabase
          .from('users')
          .update({
            subscription_tier: 'premium',
            stripe_customer_id: customerId,
            stripe_subscription_id: subscriptionId,
            stripe_price_id: subscription.items.data[0]?.price.id,
            subscription_status: subscription.status,
            trial_ends_at: trialEnd
              ? new Date(trialEnd * 1000).toISOString()
              : null,
            subscription_ends_at: currentPeriodEnd
              ? new Date(currentPeriodEnd * 1000).toISOString()
              : null,
          })
          .eq('id', userId);

        // Create subscription record
        await adminSupabase.from('subscriptions').upsert({
          user_id: userId,
          stripe_subscription_id: subscriptionId,
          stripe_customer_id: customerId,
          stripe_price_id: subscription.items.data[0]?.price.id,
          status: subscription.status,
          current_period_start: currentPeriodStart
            ? new Date(currentPeriodStart * 1000).toISOString()
            : null,
          current_period_end: currentPeriodEnd
            ? new Date(currentPeriodEnd * 1000).toISOString()
            : null,
          cancel_at_period_end: cancelAtPeriodEnd || false,
        });

        // Apply referral rewards if applicable
        try {
          // Find the referral for this user (referee)
          const { data: referral } = await adminSupabase
            .from('referrals')
            .select('id, referrer_id, status')
            .eq('referee_id', userId)
            .eq('status', 'pending')
            .single();

          if (referral && referral.status === 'pending') {
            // Update referral status to converted
            await adminSupabase
              .from('referrals')
              .update({
                status: 'converted',
                converted_at: new Date().toISOString(),
              })
              .eq('id', referral.id);

            // Give referrer 1 free month credit (capped at 12 months)
            const { data: referrer } = await adminSupabase
              .from('users')
              .select('referral_credits')
              .eq('id', referral.referrer_id)
              .single();

            if (referrer) {
              const currentCredits = referrer.referral_credits || 0;
              // Cap at 12 months total
              const newCredits = Math.min(currentCredits + 1, 12);
              
              await adminSupabase
                .from('users')
                .update({
                  referral_credits: newCredits,
                })
                .eq('id', referral.referrer_id);
            }

            // Update referral status to rewarded
            await adminSupabase
              .from('referrals')
              .update({
                status: 'rewarded',
                rewarded_at: new Date().toISOString(),
              })
              .eq('id', referral.id);
          }
        } catch (error) {
          console.error('Error applying referral rewards:', error);
        }
        break;
      }

      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;

        // Extract subscription properties with type safety
        const currentPeriodEnd = (subscription as any).current_period_end as number | undefined;
        const currentPeriodStart = (subscription as any).current_period_start as number | undefined;
        const cancelAtPeriodEnd = (subscription as any).cancel_at_period_end as boolean | undefined;

        // Find user by Stripe customer ID
        const { data: user } = await adminSupabase
          .from('users')
          .select('id')
          .eq('stripe_customer_id', customerId)
          .single();

        if (user) {
          const isDeleted = event.type === 'customer.subscription.deleted';
          const newStatus = isDeleted ? 'canceled' : subscription.status;

          // Update user subscription
          await adminSupabase
            .from('users')
            .update({
              subscription_tier: isDeleted ? 'free' : 'premium',
              subscription_status: newStatus,
              subscription_ends_at: currentPeriodEnd
                ? new Date(currentPeriodEnd * 1000).toISOString()
                : null,
            })
            .eq('id', user.id);

          // Update subscription record
          await adminSupabase
            .from('subscriptions')
            .update({
              status: newStatus,
              current_period_start: currentPeriodStart
                ? new Date(currentPeriodStart * 1000).toISOString()
                : null,
              current_period_end: currentPeriodEnd
                ? new Date(currentPeriodEnd * 1000).toISOString()
                : null,
              cancel_at_period_end: cancelAtPeriodEnd || false,
            })
            .eq('stripe_subscription_id', subscription.id);
        }
        break;
      }

      case 'invoice.paid': {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId = invoice.customer as string;

        // Extract invoice properties with type safety
        const paymentIntent = (invoice as any).payment_intent as string | Stripe.PaymentIntent | null | undefined;
        const statusTransitions = (invoice as any).status_transitions as { paid_at?: number } | undefined;

        // Find user by Stripe customer ID
        const { data: user } = await adminSupabase
          .from('users')
          .select('id')
          .eq('stripe_customer_id', customerId)
          .single();

        if (user && invoice.id) {
          // Record payment in payment_history
          await adminSupabase.from('payment_history').upsert({
            user_id: user.id,
            stripe_invoice_id: invoice.id,
            stripe_payment_intent_id:
              typeof paymentIntent === 'string'
                ? paymentIntent
                : (paymentIntent as Stripe.PaymentIntent)?.id || null,
            amount: invoice.amount_paid,
            currency: invoice.currency,
            status: 'paid',
            paid_at: statusTransitions?.paid_at
              ? new Date(statusTransitions.paid_at * 1000).toISOString()
              : null,
          });
        }
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId = invoice.customer as string;

        // Extract invoice properties with type safety
        const paymentIntent = (invoice as any).payment_intent as string | Stripe.PaymentIntent | null | undefined;

        // Find user by Stripe customer ID
        const { data: user } = await adminSupabase
          .from('users')
          .select('id')
          .eq('stripe_customer_id', customerId)
          .single();

        if (user && invoice.id) {
          // Record failed payment
          await adminSupabase.from('payment_history').upsert({
            user_id: user.id,
            stripe_invoice_id: invoice.id,
            stripe_payment_intent_id:
              typeof paymentIntent === 'string'
                ? paymentIntent
                : (paymentIntent as Stripe.PaymentIntent)?.id || null,
            amount: invoice.amount_due,
            currency: invoice.currency,
            status: 'failed',
          });
        }
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    console.log('Webhook processed successfully');
    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error: any) {
    console.error('Error processing webhook:', error);
    return NextResponse.json(
      { error: `Webhook handler failed: ${error.message}` },
      { status: 500 }
    );
  }
}

