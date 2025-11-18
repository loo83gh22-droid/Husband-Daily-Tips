import { getSession } from '@auth0/nextjs-auth0';
import { redirect } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <Link href="/dashboard" className="text-2xl font-bold text-gray-900">
              Husband Daily Tips
            </Link>
            <Link
              href="/api/auth/logout"
              className="px-4 py-2 text-gray-700 hover:text-gray-900 transition-colors"
            >
              Sign Out
            </Link>
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Link
            href="/dashboard"
            className="text-primary-600 hover:text-primary-700 font-semibold"
          >
            ← Back to Dashboard
          </Link>
        </div>

        <h1 className="text-4xl font-bold text-gray-900 mb-4 text-center">Choose Your Plan</h1>
        <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
          Select the plan that works best for you. You can upgrade or downgrade at any time.
        </p>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {plans.map((plan) => {
            const isCurrent = plan.tier === currentTier;
            const isPopular = plan.popular;

            return (
              <div
                key={plan.tier}
                className={`bg-white rounded-xl shadow-lg p-8 border-2 ${
                  isPopular
                    ? 'border-primary-600 transform scale-105'
                    : 'border-gray-200'
                } ${isCurrent ? 'ring-2 ring-primary-400' : ''}`}
              >
                {isPopular && (
                  <div className="bg-yellow-400 text-yellow-900 text-xs font-bold px-3 py-1 rounded-full inline-block mb-4">
                    MOST POPULAR
                  </div>
                )}
                {isCurrent && (
                  <div className="bg-green-100 text-green-800 text-xs font-bold px-3 py-1 rounded-full inline-block mb-4">
                    CURRENT PLAN
                  </div>
                )}
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                <div className="text-4xl font-bold text-gray-900 mb-4">
                  ${plan.price}
                  <span className="text-lg text-gray-600">/month</span>
                </div>
                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center text-gray-600">
                      <svg
                        className="w-5 h-5 text-green-500 mr-2"
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
                    className="w-full px-6 py-3 bg-gray-300 text-gray-600 rounded-lg font-semibold cursor-not-allowed"
                  >
                    Current Plan
                  </button>
                ) : (
                  <button
                    className={`w-full px-6 py-3 rounded-lg font-semibold transition-colors ${
                      isPopular
                        ? 'bg-primary-600 text-white hover:bg-primary-700'
                        : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                    }`}
                  >
                    {plan.price === 0 ? 'Downgrade' : 'Upgrade'}
                  </button>
                )}
              </div>
            );
          })}
        </div>

        <div className="mt-12 max-w-3xl mx-auto bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Payment Integration</h2>
          <p className="text-gray-600 mb-4">
            To enable payments, you'll need to integrate a payment provider like Stripe. Here's what you need to do:
          </p>
          <ol className="list-decimal list-inside space-y-2 text-gray-600">
            <li>Set up a Stripe account and get your API keys</li>
            <li>Install Stripe SDK: <code className="bg-gray-100 px-2 py-1 rounded">npm install stripe @stripe/stripe-js</code></li>
            <li>Create API routes for checkout and webhooks</li>
            <li>Update the subscription buttons to call your Stripe checkout</li>
            <li>Handle subscription updates in Supabase based on Stripe webhooks</li>
          </ol>
        </div>
      </main>
    </div>
  );
}


