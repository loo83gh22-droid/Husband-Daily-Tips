import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { stripe, STRIPE_WEBHOOK_SECRET } from '@/lib/stripe';
import { getSupabaseAdmin } from '@/lib/supabase';
import { logger } from '@/lib/logger';
import { Resend } from 'resend';
import Stripe from 'stripe';

const resend = new Resend(process.env.RESEND_API_KEY || '');

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  // Log that we received the request
  logger.log('Webhook received at:', new Date().toISOString());
  
  if (!process.env.STRIPE_SECRET_KEY || !stripe) {
    logger.error('Stripe not configured');
    return NextResponse.json(
      { error: 'Stripe is not configured' },
      { status: 500 }
    );
  }

  const body = await request.text();
  const headersList = await headers();
  const signature = headersList.get('stripe-signature');
  
  logger.log('Webhook signature present:', !!signature);

  if (!signature || !STRIPE_WEBHOOK_SECRET) {
    logger.error('Missing Stripe signature or webhook secret');
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
    logger.log('Webhook event verified:', event.type);
  } catch (err: any) {
    logger.error('Webhook signature verification failed:', err.message);
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
          logger.error('Invalid subscription ID in checkout session');
          break;
        }

        if (!userId) {
          logger.error('No user ID in checkout session metadata');
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
          logger.error('Error applying referral rewards:', error);
        }

        // Send welcome/subscription confirmation email
        try {
          const { data: user } = await adminSupabase
            .from('users')
            .select('email, name, username')
            .eq('id', userId)
            .single();

          if (user && user.email && process.env.RESEND_API_KEY) {
            const displayName = user.username || (user.name ? user.name.split(' ')[0] : 'there');
            const baseUrl = process.env.AUTH0_BASE_URL || 'https://besthusbandever.com';

            await resend.emails.send({
              from: process.env.RESEND_FROM_EMAIL || 'Best Husband Ever <action@besthusbandever.com>',
              to: user.email,
              subject: 'Welcome to Best Husband Ever! 🎉',
              html: `
                <!DOCTYPE html>
                <html>
                  <head>
                    <meta charset="utf-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                  </head>
                  <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #1f2937; background-color: #f9fafb; margin: 0; padding: 0;">
                    <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 40px 20px;">
                      <div style="text-align: center; margin-bottom: 30px;">
                        <h1 style="color: #0f172a; font-size: 28px; margin: 0 0 10px 0;">Welcome to Best Husband Ever! 🎉</h1>
                        <p style="color: #64748b; font-size: 16px; margin: 0;">Your subscription is confirmed</p>
                      </div>
                      
                      <div style="background-color: #0f172a; border-radius: 8px; padding: 30px; margin-bottom: 30px;">
                        <p style="color: #cbd5e1; font-size: 18px; margin: 0 0 15px 0;">Hey ${displayName},</p>
                        <p style="color: #cbd5e1; font-size: 16px; line-height: 1.6; margin: 0 0 15px 0;">
                          Thanks for joining! You're all set to start receiving daily personalized actions that will help you become the husband your partner deserves.
                        </p>
                        <p style="color: #cbd5e1; font-size: 16px; line-height: 1.6; margin: 0;">
                          Your subscription is active and you now have access to all premium features.
                        </p>
                      </div>
                      
                      <div style="background-color: #f3f4f6; border-radius: 8px; padding: 20px; margin-bottom: 30px;">
                        <h2 style="color: #1f2937; font-size: 18px; margin: 0 0 15px 0;">What to expect:</h2>
                        <ul style="color: #374151; font-size: 14px; margin: 0; padding-left: 20px;">
                          <li style="margin-bottom: 8px;"><strong>Daily Action Emails:</strong> You'll receive your action every day at 6am in your timezone (you can set this in your Account Settings)</li>
                          <li style="margin-bottom: 8px;"><strong>Personalized Actions:</strong> Based on your survey, relationship goals, and preferences</li>
                          <li style="margin-bottom: 8px;"><strong>Progress Tracking:</strong> Track your Husband Health score, streaks, and badges</li>
                          <li style="margin-bottom: 8px;"><strong>Private Journal:</strong> Log your wins and see your progress over time</li>
                          <li style="margin-bottom: 8px;"><strong>Team Wins:</strong> Share your completed actions with your partner</li>
                        </ul>
                      </div>
                      
                      <div style="background-color: #eff6ff; border-left: 4px solid #3b82f6; padding: 20px; margin-bottom: 30px; border-radius: 4px;">
                        <h2 style="color: #1e40af; font-size: 18px; margin: 0 0 12px 0;">✨ Get the Most Out of Your Subscription:</h2>
                        <p style="color: #1e3a8a; font-size: 14px; margin: 0 0 10px 0; line-height: 1.6;">
                          <strong>Personalize your experience</strong> by updating your Account Settings with:
                        </p>
                        <ul style="color: #1e3a8a; font-size: 14px; margin: 0; padding-left: 20px; line-height: 1.8;">
                          <li style="margin-bottom: 6px;">Your partner's name (for personalized action messages)</li>
                          <li style="margin-bottom: 6px;">Your partner's birthday (for birthday-specific actions and reminders)</li>
                          <li style="margin-bottom: 6px;">Your wedding date (to track years married in Team Wins and serve time-appropriate anniversary actions)</li>
                          <li style="margin-bottom: 6px;">Your timezone (so daily emails arrive at the perfect time)</li>
                          <li style="margin-bottom: 6px;">Your work days (so we're mindful of when we're serving specific actions, especially those that require some more planning)</li>
                        </ul>
                        <p style="color: #1e3a8a; font-size: 13px; margin: 12px 0 0 0; font-style: italic;">
                          The more details you share, the more personalized and relevant your daily actions will be!
                        </p>
                      </div>
                      
                      <div style="text-align: center; margin-bottom: 30px;">
                        <a href="${baseUrl}/dashboard" 
                           style="display: inline-block; background-color: #0ea5e9; color: #ffffff; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; margin-bottom: 15px;">
                          Go to Dashboard →
                        </a>
                        <p style="color: #6b7280; font-size: 13px; margin: 10px 0 0 0;">
                          Complete your survey if you haven't already to get personalized actions
                        </p>
                      </div>
                      
                      <div style="background-color: #fef3c7; border-left: 4px solid #fbbf24; padding: 15px; margin-bottom: 20px; border-radius: 4px;">
                        <p style="color: #92400e; font-size: 14px; margin: 0; font-weight: 600; margin-bottom: 5px;">💡 Pro Tip:</p>
                        <p style="color: #78350f; font-size: 13px; margin: 0;">
                          Consistency is key. Small daily actions compound into big relationship improvements. Show up every day, even when it's hard.
                        </p>
                      </div>
                      
                      <div style="text-align: center; padding-top: 20px; border-top: 1px solid #e5e7eb;">
                        <p style="color: #6b7280; font-size: 12px; margin: 0 0 10px 0;">
                          Questions? Just reply to this email—we're here to help.
                        </p>
                        <p style="color: #9ca3af; font-size: 11px; margin: 0;">
                          You're receiving this because you subscribed to Best Husband Ever Premium.
                        </p>
                      </div>
                    </div>
                  </body>
                </html>
              `,
            });

            logger.log(`✅ Welcome email sent to ${user.email} for subscription`);
          }
        } catch (emailError: any) {
          // Don't fail the webhook if email fails
          logger.error('Error sending welcome email:', emailError);
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
        logger.log(`Unhandled event type: ${event.type}`);
    }

    logger.log('Webhook processed successfully');
    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error: any) {
    logger.error('Error processing webhook:', error);
    return NextResponse.json(
      { error: `Webhook handler failed: ${error.message}` },
      { status: 500 }
    );
  }
}

