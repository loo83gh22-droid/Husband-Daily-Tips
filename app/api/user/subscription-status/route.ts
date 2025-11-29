import { NextResponse } from 'next/server';
import { getSession } from '@auth0/nextjs-auth0';
import { supabase } from '@/lib/supabase';

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

    const { data: user, error } = await supabase
      .from('users')
      .select('subscription_tier, trial_started_at, trial_ends_at, stripe_subscription_id')
      .eq('auth0_id', auth0Id)
      .single();

    if (error) {
      console.error('Error fetching subscription tier:', error);
      return NextResponse.json({
        tier: 'free',
        hasActiveTrial: false,
        hasSubscription: false,
        isOnPremium: false,
      });
    }

    const trialEndsAt = user?.trial_ends_at ? new Date(user.trial_ends_at) : null;
    const now = new Date();
    const hasActiveTrial = user?.subscription_tier === 'premium' && 
                          trialEndsAt && 
                          trialEndsAt > now && 
                          !user?.stripe_subscription_id;
    const hasSubscription = !!user?.stripe_subscription_id;
    const isOnPremium = user?.subscription_tier === 'premium' && hasSubscription;

    return NextResponse.json({
      tier: user?.subscription_tier || 'free',
      hasActiveTrial,
      hasSubscription,
      isOnPremium,
    });
  } catch (error) {
    console.error('Unexpected error fetching subscription:', error);
    return NextResponse.json({
      tier: 'free',
      hasActiveTrial: false,
      hasSubscription: false,
      isOnPremium: false,
    });
  }
}

