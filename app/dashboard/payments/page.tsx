import { getSession } from '@auth0/nextjs-auth0';
import { redirect } from 'next/navigation';
import DashboardNav from '@/components/DashboardNav';
import { getSupabaseAdmin } from '@/lib/supabase';
import CustomerPortalButton from '@/components/CustomerPortalButton';

async function getUserSubscription(auth0Id: string) {
  const adminSupabase = getSupabaseAdmin();
  
  const { data: user, error } = await adminSupabase
    .from('users')
    .select('subscription_tier, stripe_customer_id, subscription_status')
    .eq('auth0_id', auth0Id)
    .single();

  if (error || !user) {
    return null;
  }

  return user;
}

export default async function PaymentsPage() {
  const session = await getSession();

  if (!session?.user) {
    redirect('/api/auth/login');
  }

  const auth0Id = session.user.sub;
  const subscription = await getUserSubscription(auth0Id);
  const hasActiveSubscription = subscription?.subscription_tier === 'premium' && subscription?.stripe_customer_id;

  return (
    <div className="min-h-screen bg-slate-950">
      <DashboardNav />

      <main className="container mx-auto px-4 py-8 md:py-10">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold mb-2 bg-gradient-to-r from-primary-400 to-primary-600 bg-clip-text text-transparent">
              Payment Methods
            </h1>
            <p className="text-slate-300 text-base md:text-lg mb-4 font-medium">
              Manage your payment methods and billing information.
            </p>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-8">
            <div className="max-w-2xl mx-auto">
              {hasActiveSubscription ? (
                <>
                  <h2 className="text-xl font-semibold text-slate-50 mb-4">Manage Your Subscription</h2>
                  <p className="text-slate-300 mb-6">
                    Use the Stripe Customer Portal to securely manage your subscription, payment methods, and billing history.
                  </p>
                  <CustomerPortalButton />
                  <div className="mt-6 space-y-3 text-sm text-slate-400">
                    <p>In the portal, you can:</p>
                    <ul className="list-disc list-inside space-y-1 ml-4">
                      <li>Update your payment method</li>
                      <li>View billing history and invoices</li>
                      <li>Cancel or modify your subscription</li>
                      <li>Update billing information</li>
                    </ul>
                  </div>
                </>
              ) : (
                <>
                  <h2 className="text-xl font-semibold text-slate-50 mb-4">No Active Subscription</h2>
                  <p className="text-slate-300 mb-6">
                    You don't have an active paid subscription. Upgrade to Premium to unlock all features.
                  </p>
                  <a
                    href="/dashboard/subscription"
                    className="inline-block px-6 py-3 bg-primary-500 text-slate-950 rounded-lg font-semibold hover:bg-primary-400 transition-colors"
                  >
                    View Plans
                  </a>
                </>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

