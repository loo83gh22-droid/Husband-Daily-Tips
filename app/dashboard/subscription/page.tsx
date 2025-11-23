import { getSession } from '@auth0/nextjs-auth0';
import { redirect } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import DashboardNav from '@/components/DashboardNav';
import SubscriptionButton from '@/components/SubscriptionButton';

async function getUserSubscription(auth0Id: string) {
  try {
    const { data: user, error } = await supabase
      .from('users')
      .select('subscription_tier')
      .eq('auth0_id', auth0Id)
      .single();

    if (error) {
      console.error('Error fetching subscription tier:', error);
      return 'free'; // Default to free on error
    }

    return user?.subscription_tier || 'free';
  } catch (err) {
    console.error('Unexpected error fetching subscription:', err);
    return 'free'; // Default to free on error
  }
}

export default async function SubscriptionPage() {
  const session = await getSession();

  if (!session?.user) {
    redirect('/api/auth/login');
  }

  try {
    const auth0Id = session.user.sub;
    const currentTier = await getUserSubscription(auth0Id);

  const plans = [
    {
      name: 'Free',
      price: 0,
      tier: 'free',
      features: [
        '1 action per week',
        'Basic action library',
        'Account access',
        'No health bar tracking',
        'No badges',
        'No journal',
        'View Team Wins (read-only, cannot post)',
      ],
    },
    {
      name: 'Paid',
      price: 7,
      tier: 'premium',
      features: [
        'Daily personalized actions',
        'Full health bar tracking',
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
          <h1 className="text-3xl md:text-4xl font-semibold text-slate-50 mb-4 text-center">
            Choose Your Plan
          </h1>
          <div className="bg-primary-500/10 border border-primary-500/30 rounded-xl p-6 mb-8 max-w-2xl mx-auto text-center">
            <p className="text-primary-300 font-semibold mb-2">✨ 7-Day Free Trial</p>
            <p className="text-sm text-slate-300">
              Try everything free for 7 days. No credit card required. After the trial, choose Free or Paid.
            </p>
          </div>
          <p className="text-center text-slate-400 mb-12 max-w-2xl mx-auto">
            You can upgrade or downgrade at any time. Cancel anytime.
          </p>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {plans.map((plan) => {
            const isCurrent = plan.tier === currentTier;
            const isPopular = plan.popular;

            return (
              <div
                key={plan.tier}
                className={`bg-slate-900/80 border rounded-xl shadow-lg p-8 border-2 ${
                  isPopular
                    ? 'border-primary-600 transform scale-105'
                    : 'border-slate-800'
                } ${isCurrent ? 'ring-2 ring-primary-400' : ''}`}
              >
                {isPopular && (
                  <div className="bg-yellow-400 text-yellow-900 text-xs font-bold px-3 py-1 rounded-full inline-block mb-4">
                    MOST POPULAR
                  </div>
                )}
                {isCurrent && (
                  <div className="bg-green-500/20 text-green-400 text-xs font-bold px-3 py-1 rounded-full inline-block mb-4 border border-green-500/30">
                    CURRENT PLAN
                  </div>
                )}
                {plan.price === 0 && (
                  <div className="bg-emerald-500/10 border border-emerald-500/40 px-3 py-1 rounded-full inline-block mb-4 text-xs font-medium text-emerald-300">
                    7-DAY FREE TRIAL
                  </div>
                )}
                {plan.popular && (
                  <div className="bg-primary-500/20 border border-primary-500/40 px-3 py-1 rounded-full inline-block mb-4 text-xs font-medium text-primary-300">
                    7-DAY FREE TRIAL
                  </div>
                )}
                <h3 className="text-2xl font-bold text-slate-50 mb-2">{plan.name}</h3>
                <div className="text-4xl font-bold text-slate-50 mb-2">
                  ${plan.price}
                  <span className="text-lg text-slate-400">/month</span>
                </div>
                {plan.price > 0 && (
                  <p className="text-sm text-primary-400 font-semibold mb-4">
                    $7 a month. Less than $0.25 a day. A no-brainer to level up your biggest win.
                  </p>
                )}
                {plan.price === 0 && (
                  <p className="text-xs text-slate-400 mb-4">Free forever</p>
                )}
                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center text-slate-300">
                      <svg
                        className="w-5 h-5 text-green-400 mr-2"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                      {feature}
                    </li>
                  ))}
                </ul>
                {isCurrent ? (
                  <button
                    disabled
                    className="w-full px-6 py-3 bg-slate-800 text-slate-500 rounded-lg font-semibold cursor-not-allowed border border-slate-700"
                  >
                    Current Plan
                  </button>
                ) : (
                  <SubscriptionButton plan={plan} />
                )}
              </div>
            );
          })}
          </div>

          <div className="mt-12 max-w-3xl mx-auto bg-slate-900/80 border border-slate-800 rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-slate-50 mb-4">Payment Integration</h2>
            <p className="text-slate-300 mb-4">
              To enable payments, you'll need to integrate a payment provider like Stripe. Here's what you need to do:
            </p>
            <ol className="list-decimal list-inside space-y-2 text-slate-300">
              <li>Set up a Stripe account and get your API keys</li>
              <li>Install Stripe SDK: <code className="bg-slate-800 px-2 py-1 rounded text-slate-200">npm install stripe @stripe/stripe-js</code></li>
              <li>Create API routes for checkout and webhooks</li>
              <li>Update the subscription buttons to call your Stripe checkout</li>
              <li>Handle subscription updates in Supabase based on Stripe webhooks</li>
            </ol>
          </div>
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


