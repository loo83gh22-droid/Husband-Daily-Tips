import { getSession } from '@auth0/nextjs-auth0';
import { redirect } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import DashboardNav from '@/components/DashboardNav';
import TipCard from '@/components/TipCard';

async function getFavoriteTips(auth0Id: string) {
  const { data: user } = await supabase
    .from('users')
    .select('id')
    .eq('auth0_id', auth0Id)
    .single();

  if (!user) return [];

  const { data: userTips, error } = await supabase
    .from('user_tips')
    .select('*, tips(*)')
    .eq('user_id', user.id)
    .eq('favorited', true)
    .order('date', { ascending: false })
    .limit(100);

  if (error || !userTips) {
    return [];
  }

  return userTips;
}

export default async function FavoritesPage() {
  const session = await getSession();

  if (!session?.user) {
    redirect('/api/auth/login');
  }

  const auth0Id = session.user.sub;
  const favoriteTips = await getFavoriteTips(auth0Id);

  return (
    <div className="min-h-screen bg-slate-950">
      <DashboardNav />

      <main className="container mx-auto px-4 py-8 md:py-10">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-semibold text-slate-50 mb-2">
              Your Favorites
            </h1>
            <p className="text-slate-400 text-sm md:text-base">
              Tips you&apos;ve marked as favorites for easy reference.
            </p>
            <div className="mt-2 text-sm text-slate-500">
              {favoriteTips.length} favorite{favoriteTips.length !== 1 ? 's' : ''}
            </div>
          </div>

          {favoriteTips.length === 0 ? (
            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-8 text-center">
              <p className="text-slate-300 mb-2">No favorites yet.</p>
              <p className="text-slate-500 text-sm">
                Click the star icon on any tip to add it to your favorites.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {favoriteTips.map((userTip: any) => {
                const tip = userTip.tips;
                if (!tip) return null;

                return (
                  <TipCard
                    key={userTip.id}
                    tip={tip}
                    userTip={userTip}
                  />
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

