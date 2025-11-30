import { getSession } from '@auth0/nextjs-auth0';
import { redirect } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import DashboardNav from '@/components/DashboardNav';
import SubscriptionPlans from '@/components/SubscriptionPlans';

async function getUserSubscription(auth0Id: string) {
  try {
    const { data: user, error } = await supabase
      .from('users')
      .select('subscription_tier, trial_started_at, trial_ends_at, stripe_subscription_id')
      .eq('auth0_id', auth0Id)
      .single();

    if (error) {
      console.error('Error fetching subscription tier:', error);
      return {
        tier: 'free',
        trial_started_at: null,
        trial_ends_at: null,
        hasActiveTrial: false,
        hasSubscription: false,
        isOnPremium: false,
      };
    }

    const trialEndsAt = user?.trial_ends_at ? new Date(user.trial_ends_at) : null;
    const now = new Date();
    const hasActiveTrial = user?.subscription_tier === 'premium' && 
                          trialEndsAt && 
                          trialEndsAt > now && 
                          !user?.stripe_subscription_id;
    const hasSubscription = !!user?.stripe_subscription_id;
    // If user has subscription, they're on premium (not trial)
    const isOnPremium = user?.subscription_tier === 'premium' && hasSubscription;

    return {
      tier: user?.subscription_tier || 'free',
      trial_started_at: user?.trial_started_at || null,
      trial_ends_at: user?.trial_ends_at || null,
      hasActiveTrial,
      hasSubscription,
      isOnPremium,
    };
  } catch (err) {
    console.error('Unexpected error fetching subscription:', err);
      return {
        tier: 'free',
        trial_started_at: null,
        trial_ends_at: null,
        hasActiveTrial: false,
        hasSubscription: false,
        isOnPremium: false,
      };
  }
}

export default async function SubscriptionPage({
  searchParams,
}: {
  searchParams: { upgrade?: string };
}) {
  const session = await getSession();

  if (!session?.user) {
    redirect('/api/auth/login');
  }

  try {
    const auth0Id = session.user.sub;
    const subscriptionInfo = await getUserSubscription(auth0Id);
    const currentTier = subscriptionInfo.tier;
    const upgradeReason = searchParams?.upgrade;

    // Upgrade message based on reason
    const upgradeMessages: Record<string, { title: string; description: string }> = {
      actions: {
        title: 'Upgrade to Complete Actions',
        description: 'Free users can only complete the daily action served on the dashboard. Upgrade to Premium to complete any action from the Actions page.',
      },
      journal: {
        title: 'Upgrade to Access Journal',
        description: 'Journaling is a Premium feature. Upgrade to track your reflections and build a record of your relationship wins.',
      },
      '7day-events': {
        title: 'Upgrade to Join 7-Day Events',
        description: '7-day events are a Premium feature. Join structured 7-day events designed to level up your relationship skills. Upgrade to unlock this feature and more.',
      },
    };

    const upgradeMessage = upgradeReason ? upgradeMessages[upgradeReason] : null;

  const plans = [
    {
      name: 'Free',
      price: 0,
      tier: 'free',
      interval: 'month' as const,
      features: [
        '1 action per week',
        'Basic action library',
        'Account access',
        'No Husband Health tracking',
        'No badges',
        'No journal',
        'View Team Wins (read-only, cannot post)',
      ],
    },
    {
      name: 'Premium',
      price: 7,
      priceAnnual: 71.40,
      tier: 'premium',
      interval: 'month' as const,
      features: [
        'Daily routine actions delivered via email',
        'Weekly planning actions (require more planning)',
        'Weekly summary email (reminder to reflect on accomplishments)',
        'Full Husband Health tracking',
        'Achievement badges',
        'Private journal & Team Wins',
        'All features unlocked',
        'Real, practical relationship tips',
      ],
      popular: true,
    },
  ];

  return (
    <div className="min-h-screen bg-slate-950">
      <DashboardNav />

      <main className="container mx-auto px-4 py-8 md:py-10">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold mb-2 bg-gradient-to-r from-primary-400 to-primary-600 bg-clip-text text-transparent text-center">
            Choose Your Plan
          </h1>
          <div className="bg-primary-500/10 border border-primary-500/30 rounded-xl p-6 mb-8 max-w-2xl mx-auto text-center">
            <p className="text-primary-300 font-semibold mb-2">✨ 7-Day Free Trial</p>
            <p className="text-sm text-slate-300">
              Try everything free for 7 days. No credit card required. After the trial, choose Free or Premium.
            </p>
            {subscriptionInfo.hasActiveTrial && subscriptionInfo.trial_ends_at && (
              <p className="text-xs text-primary-400 mt-3">
                Your trial ends {new Date(subscriptionInfo.trial_ends_at).toLocaleDateString()}
              </p>
            )}
          </div>
          {upgradeMessage && (
            <div className="bg-gradient-to-r from-primary-500/10 to-primary-600/10 border border-primary-500/30 rounded-xl p-6 mb-8 max-w-2xl mx-auto">
              <h2 className="text-xl font-semibold text-primary-300 mb-2">{upgradeMessage.title}</h2>
              <p className="text-slate-300">{upgradeMessage.description}</p>
            </div>
          )}

          <p className="text-center text-slate-400 mb-6 max-w-2xl mx-auto">
            You can upgrade or downgrade at any time. Cancel anytime.
          </p>

          <SubscriptionPlans
            plans={plans}
            currentTier={currentTier}
            hasActiveTrial={subscriptionInfo.hasActiveTrial || undefined}
            trialEndsAt={subscriptionInfo.trial_ends_at}
            isOnPremium={subscriptionInfo.isOnPremium}
          />
        </div>
      </main>
    </div>
    );
  } catch (error: any) {
    // Re-throw NEXT_REDIRECT errors so Next.js can handle them
    if (error?.digest === 'NEXT_REDIRECT' || error?.message === 'NEXT_REDIRECT') {
      throw error;
    }
    
    console.error('Error rendering subscription page:', error);
    // Return error UI for other errors
    return (
      <div className="min-h-screen bg-slate-950">
        <DashboardNav />
        <main className="container mx-auto px-4 py-8 md:py-10">
          <div className="max-w-4xl mx-auto">
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-8">
              <h1 className="text-2xl font-semibold text-red-300 mb-4">Error Loading Subscription Page</h1>
              <p className="text-slate-300">
                There was an error loading the subscription page. Please try refreshing the page.
              </p>
              <p className="text-xs text-slate-500 mt-4">
                Error: {error instanceof Error ? error.message : 'Unknown error'}
              </p>
            </div>
          </div>
        </main>
      </div>
    );
  }
}


