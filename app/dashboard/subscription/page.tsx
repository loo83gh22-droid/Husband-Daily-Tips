import { getSession } from '@auth0/nextjs-auth0';
import { redirect } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import DashboardNav from '@/components/DashboardNav';

async function getUserSubscription(auth0Id: string) {
  const { data: user } = await supabase
    .from('users')
    .select('subscription_tier')
    .eq('auth0_id', auth0Id)
    .single();

  return user?.subscription_tier || 'free';
}

export default async function SubscriptionPage() {
  const session = await getSession();

  if (!session?.user) {
    redirect('/api/auth/login');
  }

  const auth0Id = session.user.sub;
  const currentTier = await getUserSubscription(auth0Id);

  const plans = [
    {
      name: 'Free',
      price: 0,
      tier: 'free',
      features: [
        '1 tip per week',
        'Basic tips library',
        'Account access',
      ],
    },
    {
      name: 'Premium',
      price: 19.99,
      tier: 'premium',
      features: [
        'Daily personalized tips',
        'Progress tracking',
        'Achievement badges',
        'Expert relationship advice',
        'Tip favorites',
      ],
      popular: true,
    },
    {
      name: 'Pro',
      price: 29.99,
      tier: 'pro',
      features: [
        'Everything in Premium',
        'Weekly coaching resources',
        'Priority support',
        'Advanced analytics',
        'Relationship check-ins',
      ],
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
          <p className="text-center text-slate-400 mb-12 max-w-2xl mx-auto">
            Select the plan that works best for you. You can upgrade or downgrade at any time.
          </p>

          <div className="grid md:grid-cols-3 gap-8">
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
                <h3 className="text-2xl font-bold text-slate-50 mb-2">{plan.name}</h3>
                <div className="text-4xl font-bold text-slate-50 mb-4">
                  ${plan.price}
                  <span className="text-lg text-slate-400">/month</span>
                </div>
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
                  <button
                    className={`w-full px-6 py-3 rounded-lg font-semibold transition-colors ${
                      isPopular
                        ? 'bg-primary-500 text-slate-950 hover:bg-primary-400'
                        : 'bg-slate-800 text-slate-200 hover:bg-slate-700 border border-slate-700'
                    }`}
                  >
                    {plan.price === 0 ? 'Downgrade' : 'Upgrade'}
                  </button>
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
}


