import { getSession } from '@auth0/nextjs-auth0';
import { redirect } from 'next/navigation';
import DashboardNav from '@/components/DashboardNav';

export default async function AccountPage() {
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
              Account Settings
            </h1>
            <p className="text-slate-400 text-sm md:text-base">
              Manage your account information and preferences.
            </p>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-8">
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Email
                </label>
                <p className="text-slate-200">{session.user.email}</p>
                <p className="text-xs text-slate-500 mt-1">
                  Managed by Auth0. Update your email in your Auth0 account settings.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Name
                </label>
                <p className="text-slate-200">{session.user.name || 'Not set'}</p>
              </div>

              <div className="pt-4 border-t border-slate-800">
                <h3 className="text-sm font-semibold text-slate-200 mb-4">Preferences</h3>
                <p className="text-sm text-slate-400">
                  More account settings coming soon.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

