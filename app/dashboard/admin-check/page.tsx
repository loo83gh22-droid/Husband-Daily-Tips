import { getSession } from '@auth0/nextjs-auth0';
import { redirect } from 'next/navigation';
import DashboardNav from '@/components/DashboardNav';

async function checkEnvVars() {
  const requiredEnvVars = {
    AUTH0_SECRET: !!process.env.AUTH0_SECRET,
    AUTH0_BASE_URL: !!process.env.AUTH0_BASE_URL,
    AUTH0_ISSUER_BASE_URL: !!process.env.AUTH0_ISSUER_BASE_URL,
    AUTH0_CLIENT_ID: !!process.env.AUTH0_CLIENT_ID,
    AUTH0_CLIENT_SECRET: !!process.env.AUTH0_CLIENT_SECRET,
    NEXT_PUBLIC_SUPABASE_URL: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    SUPABASE_SERVICE_ROLE_KEY: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    STRIPE_SECRET_KEY: !!process.env.STRIPE_SECRET_KEY,
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: !!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
    STRIPE_WEBHOOK_SECRET: !!process.env.STRIPE_WEBHOOK_SECRET,
    RESEND_API_KEY: !!process.env.RESEND_API_KEY,
    RESEND_FROM_EMAIL: !!process.env.RESEND_FROM_EMAIL,
    ADMIN_EMAIL: !!process.env.ADMIN_EMAIL,
  };

  const allSet = Object.values(requiredEnvVars).every(Boolean);
  const missing = Object.entries(requiredEnvVars)
    .filter(([_, isSet]) => !isSet)
    .map(([key]) => key);

  return {
    allSet,
    missing,
    total: Object.keys(requiredEnvVars).length,
    set: Object.keys(requiredEnvVars).length - missing.length,
  };
}

export default async function AdminCheckPage() {
  const session = await getSession();

  if (!session?.user) {
    redirect('/api/auth/login');
  }

  const envCheck = await checkEnvVars();

  return (
    <div className="min-h-screen bg-slate-950">
      <DashboardNav />

      <main className="container mx-auto px-4 py-8 md:py-10">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold mb-8 bg-gradient-to-r from-primary-400 to-primary-600 bg-clip-text text-transparent">
            Pre-Launch Checklist
          </h1>

          {/* Environment Variables Check */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-6 mb-6">
            <h2 className="text-xl font-semibold text-slate-50 mb-4">
              Environment Variables
            </h2>
            <div className="space-y-2 mb-4">
              <div className="flex items-center justify-between">
                <span className="text-slate-300">Status</span>
                <span className={`font-semibold ${envCheck.allSet ? 'text-green-400' : 'text-red-400'}`}>
                  {envCheck.allSet ? '✅ All Set' : `❌ ${envCheck.missing.length} Missing`}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-300">Set</span>
                <span className="text-slate-200">
                  {envCheck.set}/{envCheck.total}
                </span>
              </div>
            </div>
            {envCheck.missing.length > 0 && (
              <div className="mt-4 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
                <p className="text-sm font-semibold text-red-400 mb-2">Missing Variables:</p>
                <ul className="list-disc list-inside text-sm text-slate-300 space-y-1">
                  {envCheck.missing.map((key) => (
                    <li key={key}>{key}</li>
                  ))}
                </ul>
                <p className="text-xs text-slate-400 mt-3">
                  Set these in Vercel Environment Variables or your .env.local file
                </p>
              </div>
            )}
            <div className="mt-4">
              <a
                href="/api/admin/check-env"
                target="_blank"
                className="text-sm text-primary-400 hover:text-primary-300"
              >
                View detailed check →
              </a>
            </div>
          </div>

          {/* Database Migrations Check */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-6 mb-6">
            <h2 className="text-xl font-semibold text-slate-50 mb-4">
              Database Migrations
            </h2>
            <p className="text-slate-300 text-sm mb-4">
              Run the migration check script to verify all migrations have been applied:
            </p>
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-4 mb-4">
              <code className="text-sm text-slate-300">
                npm run check:migrations
              </code>
            </div>
            <p className="text-xs text-slate-400">
              This will compare migration files with what's in your Supabase database.
            </p>
          </div>

          {/* Quick Links */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-6">
            <h2 className="text-xl font-semibold text-slate-50 mb-4">
              Quick Actions
            </h2>
            <div className="space-y-2">
              <a
                href="/api/admin/check-env"
                target="_blank"
                className="block text-primary-400 hover:text-primary-300 text-sm"
              >
                → Check Environment Variables (API)
              </a>
              <a
                href="/dashboard"
                className="block text-primary-400 hover:text-primary-300 text-sm"
              >
                → Back to Dashboard
              </a>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

