import { getSession } from '@auth0/nextjs-auth0';
import { redirect } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import DashboardNav from '@/components/DashboardNav';
import FavoriteCard from '@/components/FavoriteCard';

async function getFavorites(auth0Id: string) {
  const { data: user } = await supabase
    .from('users')
    .select('id')
    .eq('auth0_id', auth0Id)
    .single();

  if (!user) return { tips: [], actions: [] };

  // Get favorited tips
  const { data: favoritedTips } = await supabase
    .from('user_tips')
    .select('*, tips(*)')
    .eq('user_id', user.id)
    .eq('favorited', true)
    .order('date', { ascending: false });

  // Get favorited actions
  const { data: favoritedActions } = await supabase
    .from('user_daily_actions')
    .select('*, actions(*)')
    .eq('user_id', user.id)
    .eq('favorited', true)
    .order('date', { ascending: false });

  const tips = favoritedTips
    ? favoritedTips
        .filter((ut) => ut.tips) // Filter out any null tips
        .map((ut) => ({
          id: ut.id,
          type: 'tip' as const,
          date: ut.date,
          item: ut.tips,
          userItemId: ut.id,
        }))
    : [];

  const actions = favoritedActions
    ? favoritedActions
        .filter((ua) => ua.actions) // Filter out any null actions
        .map((ua) => ({
          id: ua.id,
          type: 'action' as const,
          date: ua.date,
          item: ua.actions,
          userItemId: ua.id,
        }))
    : [];

  // Combine and sort by date (most recent first)
  const allFavorites = [...tips, ...actions].sort((a, b) => {
    const dateA = new Date(a.date).getTime();
    const dateB = new Date(b.date).getTime();
    return dateB - dateA;
  });

  return { 
    favorites: allFavorites || [], 
    tipsCount: tips?.length || 0, 
    actionsCount: actions?.length || 0 
  };
}

export default async function FavoritesPage() {
  const session = await getSession();

  if (!session?.user) {
    redirect('/api/auth/login');
  }

  const auth0Id = session.user.sub;
  const { favorites, tipsCount, actionsCount } = await getFavorites(auth0Id);
  
  const favoritesList = favorites || [];
  const totalFavorites = favoritesList.length;

  return (
    <div className="min-h-screen bg-slate-950">
      <DashboardNav />

      <main className="container mx-auto px-4 py-8 md:py-10">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-semibold text-slate-50 mb-2">
              Your Favorites
            </h1>
            <p className="text-slate-400 text-sm md:text-base mb-4">
              All your saved tips and actions in one place.
            </p>
            <div className="flex items-center gap-4 text-sm">
              <span className="text-slate-300">
                <span className="font-semibold text-primary-300">{totalFavorites}</span> total
                favorites
              </span>
              <span className="text-slate-500">•</span>
              <span className="text-slate-400">
                <span className="font-semibold text-yellow-300">{tipsCount || 0}</span> tips
              </span>
              <span className="text-slate-500">•</span>
              <span className="text-slate-400">
                <span className="font-semibold text-yellow-300">{actionsCount || 0}</span> actions
              </span>
            </div>
          </div>

          {totalFavorites === 0 ? (
            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-8 text-center">
              <div className="text-5xl mb-4">⭐</div>
              <p className="text-slate-300 text-lg mb-2">No favorites yet</p>
              <p className="text-slate-500 text-sm">
                Start favoriting tips and actions to save them here for easy access!
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {favoritesList.map((favorite) => (
                <FavoriteCard
                  key={`${favorite.type}-${favorite.id}`}
                  favorite={favorite}
                />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
