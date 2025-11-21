import { getSession } from '@auth0/nextjs-auth0';
import { redirect } from 'next/navigation';
import DashboardNav from '@/components/DashboardNav';

export default async function PaymentsPage() {
  const session = await getSession();

  if (!session?.user) {
    redirect('/api/auth/login');
  }

  return (
    <div className="min-h-screen bg-slate-950">
      <DashboardNav />

      <main className="container mx-auto px-4 py-8 md:py-10">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-semibold text-slate-50 mb-2">
              Payment Methods
            </h1>
            <p className="text-slate-400 text-sm md:text-base">
              Manage your payment methods and billing information.
            </p>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-8">
            <div className="max-w-2xl mx-auto">
              <h2 className="text-xl font-semibold text-slate-50 mb-4">Payment Integration</h2>
              <p className="text-slate-300 mb-6">
                We will integrate Stripe here in the future for secure payment processing. This will allow you to:
              </p>
              <ul className="space-y-3 text-slate-300 mb-6">
                <li className="flex items-start gap-3">
                  <span className="text-green-400 mt-1">✓</span>
                  <span>Securely manage your payment methods</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green-400 mt-1">✓</span>
                  <span>Update billing information</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green-400 mt-1">✓</span>
                  <span>View payment history</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green-400 mt-1">✓</span>
                  <span>Cancel or modify your subscription</span>
                </li>
              </ul>
              <div className="bg-primary-500/10 border border-primary-500/30 rounded-lg p-4">
                <p className="text-primary-300 text-sm">
                  <strong>Coming Soon:</strong> Stripe integration for seamless payment management.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

