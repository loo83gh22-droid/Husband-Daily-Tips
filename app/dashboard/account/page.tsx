import { getSession } from '@auth0/nextjs-auth0';
import { redirect } from 'next/navigation';
import { getSupabaseAdmin } from '@/lib/supabase';
import DashboardNav from '@/components/DashboardNav';
import HiddenActionsManager from '@/components/HiddenActionsManager';
import AccountSettingsForm from '@/components/AccountSettingsForm';

async function getUserData(auth0Id: string) {
  const adminSupabase = getSupabaseAdmin();
  const { data: user, error } = await adminSupabase
    .from('users')
      .select('*, username, name, email, has_kids, kids_live_with_you, country, partner_name, spouse_birthday, work_days, show_all_country_actions')
    .eq('auth0_id', auth0Id)
    .single();

  if (error && error.code !== 'PGRST116') {
    console.error('Error fetching user:', error);
  }

  return user;
}

export default async function AccountPage() {
  const session = await getSession();

  if (!session?.user) {
    redirect('/api/auth/login');
  }

  const auth0Id = session.user.sub;
  const user = await getUserData(auth0Id);

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-950">
        <DashboardNav />
        <main className="container mx-auto px-4 py-8 md:py-12 max-w-full overflow-x-hidden">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl md:text-4xl font-bold mb-2 bg-gradient-to-r from-primary-400 to-primary-600 bg-clip-text text-transparent">
              Account Settings
            </h1>
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-6 text-red-300">
              <p className="font-semibold mb-2">User not found</p>
              <p className="text-sm text-red-200">
                Your account may not be fully set up yet. Please try refreshing the page or contact support if this issue persists.
              </p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950">
      <DashboardNav />
      <main className="container mx-auto px-4 py-8 md:py-12 max-w-full overflow-x-hidden">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold mb-2 bg-gradient-to-r from-primary-400 to-primary-600 bg-clip-text text-transparent">
            Account Settings
          </h1>

          <div className="space-y-8">
            {/* Account Settings Form */}
            {user && (
              <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-6 md:p-8">
                <h2 className="text-xl font-semibold text-slate-200 mb-6">Profile Settings</h2>
                <AccountSettingsForm 
                  initialData={{
                    username: user.username || null,
                    profile_picture: user.profile_picture || null,
                    post_anonymously: user.post_anonymously || false,
                    timezone: user.timezone || 'America/New_York',
                    wedding_date: user.wedding_date || null,
                    has_kids: user.has_kids ?? null,
                    kids_live_with_you: user.kids_live_with_you ?? null,
                    country: user.country || null,
                    partner_name: user.partner_name || null,
                    spouse_birthday: user.spouse_birthday || null,
                    work_days: user.work_days || null,
                    show_all_country_actions: user.show_all_country_actions || false,
                  }}
                />
              </div>
            )}

            {/* Hidden Actions Manager */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-6 md:p-8">
              <h2 className="text-xl font-semibold text-slate-200 mb-2">Hidden Actions</h2>
              <p className="text-sm text-slate-400 mb-6">
                Actions you've hidden won't appear in your daily recommendations. You can unhide them here if your situation changes.
              </p>
              <HiddenActionsManager />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
