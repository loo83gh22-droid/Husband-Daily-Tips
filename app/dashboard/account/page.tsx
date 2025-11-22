import { getSession } from '@auth0/nextjs-auth0';
import { redirect } from 'next/navigation';
import DashboardNav from '@/components/DashboardNav';
import AccountSettingsForm from '@/components/AccountSettingsForm';
import { supabase } from '@/lib/supabase';

async function getUserProfile(auth0Id: string) {
  try {
    const { data: user, error } = await supabase
      .from('users')
      .select('username, wedding_date, post_anonymously, timezone, profile_picture, has_kids, kids_live_with_you')
      .eq('auth0_id', auth0Id)
      .single();

    if (error) {
      console.error('Error fetching user profile:', error);
      return {
        username: null,
        wedding_date: null,
        post_anonymously: false,
        timezone: 'America/New_York',
        profile_picture: null,
      };
    }

    return {
      username: user?.username || null,
      wedding_date: user?.wedding_date || null,
      post_anonymously: user?.post_anonymously || false,
      timezone: user?.timezone || 'America/New_York',
      profile_picture: user?.profile_picture || null,
      has_kids: user?.has_kids ?? null,
      kids_live_with_you: user?.kids_live_with_you ?? null,
    };
  } catch (err) {
    console.error('Unexpected error fetching profile:', err);
    return {
      username: null,
      wedding_date: null,
      post_anonymously: false,
      timezone: 'America/New_York',
      profile_picture: null,
      has_kids: null,
      kids_live_with_you: null,
    };
  }
}

export default async function AccountPage() {
  const session = await getSession();

  if (!session?.user) {
    redirect('/api/auth/login');
  }

  const auth0Id = session.user.sub;
  const profileData = await getUserProfile(auth0Id);

  return (
    <div className="min-h-screen bg-slate-950">
      <DashboardNav />

      <main className="container mx-auto px-4 py-8 md:py-10">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-semibold text-slate-50 mb-2">
              Profile & Account Settings
            </h1>
            <p className="text-slate-400 text-sm md:text-base">
              Manage your profile information and preferences.
            </p>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-6 md:p-8">
            <div className="mb-6 pb-6 border-b border-slate-800">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Email</label>
                <p className="text-slate-200">{session.user.email}</p>
              </div>
              <div className="mt-4">
                <label className="block text-sm font-medium text-slate-300 mb-2">Name</label>
                <p className="text-slate-200">{session.user.name || 'Not set'}</p>
              </div>
            </div>

            <AccountSettingsForm initialData={profileData} />
          </div>
        </div>
      </main>
    </div>
  );
}

