import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { stripe, STRIPE_WEBHOOK_SECRET } from '@/lib/stripe';
import { getSupabaseAdmin } from '@/lib/supabase';
import Stripe from 'stripe';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  const body = await request.text();
  const headersList = await headers();
  const signature = headersList.get('stripe-signature');

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

        // Get subscription details
        const subscription = await stripe.subscriptions.retrieve(subscriptionId);
        const userId = session.metadata?.user_id;

        if (userId) {
          // Update user subscription
          await adminSupabase
            .from('users')
            .update({
              subscription_tier: 'premium',
              stripe_customer_id: customerId,
              stripe_subscription_id: subscriptionId,
              stripe_price_id: subscription.items.data[0]?.price.id,
              subscription_status: subscription.status,
              trial_ends_at: subscription.trial_end
                ? new Date(subscription.trial_end * 1000).toISOString()
                : null,
              subscription_ends_at: subscription.current_period_end
                ? new Date(subscription.current_period_end * 1000).toISOString()
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
            current_period_start: subscription.current_period_start
              ? new Date(subscription.current_period_start * 1000).toISOString()
              : null,
            current_period_end: subscription.current_period_end
              ? new Date(subscription.current_period_end * 1000).toISOString()
              : null,
            cancel_at_period_end: subscription.cancel_at_period_end || false,
          });
        }
        break;
      }

      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;

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
              subscription_ends_at: subscription.current_period_end
                ? new Date(subscription.current_period_end * 1000).toISOString()
                : null,
            })
            .eq('id', user.id);

          // Update subscription record
          await adminSupabase
            .from('subscriptions')
            .update({
              status: newStatus,
              current_period_start: subscription.current_period_start
                ? new Date(subscription.current_period_start * 1000).toISOString()
                : null,
              current_period_end: subscription.current_period_end
                ? new Date(subscription.current_period_end * 1000).toISOString()
                : null,
              cancel_at_period_end: subscription.cancel_at_period_end || false,
            })
            .eq('stripe_subscription_id', subscription.id);
        }
        break;
      }

      case 'invoice.paid': {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId = invoice.customer as string;

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
              typeof invoice.payment_intent === 'string'
                ? invoice.payment_intent
                : invoice.payment_intent?.id || null,
            amount: invoice.amount_paid,
            currency: invoice.currency,
            status: 'paid',
            paid_at: invoice.status_transitions.paid_at
              ? new Date(invoice.status_transitions.paid_at * 1000).toISOString()
              : null,
          });
        }
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId = invoice.customer as string;

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
              typeof invoice.payment_intent === 'string'
                ? invoice.payment_intent
                : invoice.payment_intent?.id || null,
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

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error('Error processing webhook:', error);
    return NextResponse.json(
      { error: `Webhook handler failed: ${error.message}` },
      { status: 500 }
    );
  }
}

