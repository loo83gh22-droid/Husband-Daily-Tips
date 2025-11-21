import { getSession } from '@auth0/nextjs-auth0';
import { redirect } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import DashboardNav from '@/components/DashboardNav';
import AccountProfileForm from '@/components/AccountProfileForm';

async function getUserProfile(auth0Id: string) {
  try {
    // Try to get wedding_date first (if migration has been run)
    const { data: user, error } = await supabase
      .from('users')
      .select('username, wedding_date, post_anonymously, name')
      .eq('auth0_id', auth0Id)
      .single();

    if (error) {
      // If error is about column not existing, try with years_married as fallback
      if (error.message?.includes('wedding_date') || error.code === '42703') {
        const { data: userFallback, error: fallbackError } = await supabase
          .from('users')
          .select('username, years_married, post_anonymously, name')
          .eq('auth0_id', auth0Id)
          .single();

        if (fallbackError || !userFallback) {
          return {
            username: null,
            wedding_date: null,
            post_anonymously: false,
            name: null,
          };
        }

        return {
          username: userFallback.username,
          wedding_date: null, // Migration not run yet
          post_anonymously: userFallback.post_anonymously || false,
          name: userFallback.name,
        };
      }

      return {
        username: null,
        wedding_date: null,
        post_anonymously: false,
        name: null,
      };
    }

    if (!user) {
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
  } catch (err) {
    console.error('Error fetching user profile:', err);
    return {
      username: null,
      wedding_date: null,
      post_anonymously: false,
      name: null,
    };
  }
}

export default async function AccountPage() {
  const session = await getSession();

  if (!session?.user) {
    redirect('/api/auth/login');
  }

  try {
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
  } catch (error: any) {
    // Re-throw NEXT_REDIRECT errors so Next.js can handle them
    if (error?.digest === 'NEXT_REDIRECT' || error?.message === 'NEXT_REDIRECT') {
      throw error;
    }
    
    console.error('Error rendering account page:', error);
    // Return error UI for other errors
    return (
      <div className="min-h-screen bg-slate-950">
        <DashboardNav />
        <main className="container mx-auto px-4 py-8 md:py-10">
          <div className="max-w-4xl mx-auto">
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-8">
              <h1 className="text-2xl font-semibold text-red-300 mb-4">Error Loading Account Settings</h1>
              <p className="text-slate-300">
                There was an error loading your account settings. Please try refreshing the page.
              </p>
              <p className="text-xs text-slate-500 mt-4">
                Error: {error instanceof Error ? error.message : 'Unknown error'}
              </p>
            </div>
          </div>
        </main>
      </div>
    );
  }
}

