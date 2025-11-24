import { getSession } from '@auth0/nextjs-auth0';
import { redirect } from 'next/navigation';
import DashboardNav from '@/components/DashboardNav';
import ReferralDashboard from '@/components/ReferralDashboard';

export default async function ReferralsPage() {
  const session = await getSession();

  if (!session?.user) {
    redirect('/api/auth/login');
  }

  return (
    <div className="min-h-screen bg-slate-950">
      <DashboardNav />
      <main className="container mx-auto px-4 py-8 md:py-12">
        <div className="max-w-4xl mx-auto">
          <ReferralDashboard />
        </div>
      </main>
    </div>
  );
}

