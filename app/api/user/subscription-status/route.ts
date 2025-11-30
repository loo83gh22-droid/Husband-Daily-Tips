import { NextResponse } from 'next/server';
import { getSession } from '@auth0/nextjs-auth0';
import { getSupabaseAdmin } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

/**
 * Get user's subscription status for client-side checks
 */
export async function GET() {
  try {
    const session = await getSession();

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const auth0Id = session.user.sub;
    const adminSupabase = getSupabaseAdmin();

    const { data: user, error } = await adminSupabase
      .from('users')
      .select('subscription_tier, trial_started_at, trial_ends_at, stripe_subscription_id')
      .eq('auth0_id', auth0Id)
      .single();

    if (error) {
      console.error('Error fetching subscription tier:', error);
      const errorResponse = NextResponse.json({
        tier: 'free',
        hasActiveTrial: false,
        hasSubscription: false,
        isOnPremium: false,
      });
      errorResponse.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
      return errorResponse;
    }

    const trialEndsAt = user?.trial_ends_at ? new Date(user.trial_ends_at) : null;
    const trialStartedAt = user?.trial_started_at ? new Date(user.trial_started_at) : null;
    const now = new Date();
    // Active trial: premium tier, has trial dates, trial hasn't ended, and no paid subscription
    const hasActiveTrial = user?.subscription_tier === 'premium' && 
                          trialStartedAt && 
                          trialEndsAt && 
                          trialEndsAt > now && 
                          !user?.stripe_subscription_id;
    const hasSubscription = !!user?.stripe_subscription_id;
    const isOnPremium = user?.subscription_tier === 'premium' && hasSubscription;

    const response = NextResponse.json({
      tier: user?.subscription_tier || 'free',
      hasActiveTrial,
      hasSubscription,
      isOnPremium,
    });
    
    // Prevent caching of subscription status
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    
    return response;
  } catch (error) {
    console.error('Unexpected error fetching subscription:', error);
    const errorResponse = NextResponse.json({
      tier: 'free',
      hasActiveTrial: false,
      hasSubscription: false,
      isOnPremium: false,
    });
    errorResponse.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
    return errorResponse;
  }
}

