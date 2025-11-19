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
            <p className="text-slate-400 text-center py-8">
              Payment integration coming soon. This will connect to Stripe for secure payment processing.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

