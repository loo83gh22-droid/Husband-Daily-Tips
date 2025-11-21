import { getSession } from '@auth0/nextjs-auth0';
import { redirect } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import DashboardNav from '@/components/DashboardNav';
import AccountProfileForm from '@/components/AccountProfileForm';

async function getUserProfile(auth0Id: string) {
  const { data: user, error } = await supabase
    .from('users')
    .select('username, wedding_date, post_anonymously, name')
    .eq('auth0_id', auth0Id)
    .single();

  if (error || !user) {
    return {
      username: null,
      wedding_date: null,
      post_anonymously: false,
      name: null,
    };
  }

  return {
    username: user.username,
    wedding_date: user.wedding_date,
    post_anonymously: user.post_anonymously || false,
    name: user.name,
  };
}

export default async function AccountPage() {
  const session = await getSession();

  if (!session?.user) {
    redirect('/api/auth/login');
  }

  const auth0Id = session.user.sub;
  const profile = await getUserProfile(auth0Id);

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
            <AccountProfileForm
              initialProfile={profile}
              email={session.user.email || ''}
            />
          </div>
        </div>
      </main>
    </div>
  );
}

