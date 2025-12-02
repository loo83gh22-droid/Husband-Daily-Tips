import { getSession } from '@auth0/nextjs-auth0';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getSupabaseAdmin } from '@/lib/supabase';
import DashboardNav from '@/components/DashboardNav';
import ActionsPageClient from '@/components/ActionsPageClient';
import ActionTooltip from '@/components/ActionTooltip';
import BackToTop from '@/components/BackToTop';
import OutstandingActions from '@/components/OutstandingActions';

async function getActions(auth0Id: string) {
  // Use admin client to bypass RLS (Auth0 context isn't set)
  const adminSupabase = getSupabaseAdmin();
  const { data: user } = await adminSupabase
    .from('users')
    .select('id, partner_name, subscription_tier, trial_ends_at, stripe_subscription_id, country')
    .eq('auth0_id', auth0Id)
    .single();

  if (!user) return { 
    actions: [], 
    completedMap: new Map(), 
    favoritedActions: [], 
    currentStreak: 0,
    actionsThisWeek: 0,
    badgesEarned: 0,
    hasPremiumAccess: false,
  };

  // Get all actions - use distinct to avoid duplicates
  // Order by display_order (marriage importance), then by name
  // Include benefit field for detail modal and created_at for "New" badge
  const { data: actions } = await adminSupabase
    .from('actions')
    .select('*, benefit, created_at')
    .order('display_order', { ascending: true, nullsFirst: false })
    .order('name', { ascending: true });

  // Filter actions by country: if action is country-specific, user must match
  // Actions without a country are available to everyone
  let filteredActions = actions || [];
  if (actions) {
    const userCountry = user.country as 'US' | 'CA' | null;
    filteredActions = actions.filter((action) => {
      // If action has a country, user must match
      if (action.country && action.country !== userCountry) {
        return false;
      }
      // If action has a country but user has no country, don't show it
      if (action.country && !userCountry) {
        return false;
      }
      // Actions without a country or matching country are shown
      return true;
    });
  }

  // Remove any duplicates by ID (in case database has duplicates)
  const uniqueActions = filteredActions
    ? filteredActions.filter(
        (action, index, self) =>
          index === self.findIndex((a) => a.id === action.id),
      )
    : [];

  // Get user's completed actions (all instances)
  const { data: completions } = await adminSupabase
    .from('user_action_completions')
    .select('id, action_id, completed_at, notes')
    .eq('user_id', user.id)
    .order('completed_at', { ascending: false });

  // Group completions by action_id
  const completedMap = new Map<string, Array<{ id: string; completed_at: string; notes: string | null }>>();
  completions?.forEach((c) => {
    if (!completedMap.has(c.action_id)) {
      completedMap.set(c.action_id, []);
    }
    completedMap.get(c.action_id)!.push({
      id: c.id,
      completed_at: c.completed_at,
      notes: c.notes,
    });
  });

  // Get favorited actions
  const { data: favoritedActionsData } = await adminSupabase
    .from('user_daily_actions')
    .select('*, actions(*)')
    .eq('user_id', user.id)
    .eq('favorited', true)
    .order('date', { ascending: false });

  // Extract unique favorited actions (by action_id)
  const favoritedActionIds = new Set<string>();
  const favoritedActions = favoritedActionsData
    ? favoritedActionsData
        .filter((fad) => {
          const actionId = fad.actions?.id;
          if (!actionId || !fad.actions || favoritedActionIds.has(actionId)) return false;
          favoritedActionIds.add(actionId);
          return true;
        })
        .map((fad) => ({
          ...fad.actions,
          favorited: true,
          favoritedDate: fad.date,
        }))
        .filter((action) => action && action.id) // Filter out null/undefined actions
    : [];

  // Convert Map to plain object for serialization
  const completedMapObj: Record<string, Array<{ id: string; completed_at: string; notes: string | null }>> = {};
  completedMap.forEach((value, key) => {
    completedMapObj[key] = value;
  });

  // Calculate streak from user_tips
  const { data: tips } = await adminSupabase
    .from('user_tips')
    .select('date')
    .eq('user_id', user.id)
    .order('date', { ascending: false });

  let currentStreak = 0;
  if (tips && tips.length > 0) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < 365; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(today.getDate() - i);
      const dateStr = checkDate.toISOString().split('T')[0];

      if (tips.some((t) => t.date === dateStr)) {
        currentStreak++;
      } else {
        break;
      }
    }
  }

  // Calculate actions completed this week (for engagement metric)
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  const weekAgoISO = weekAgo.toISOString();

  const { data: recentCompletions } = await adminSupabase
    .from('user_action_completions')
    .select('id')
    .eq('user_id', user.id)
    .gte('completed_at', weekAgoISO);

  const actionsThisWeek: number = recentCompletions ? recentCompletions.length : 0;

  // Get badge count for engagement
  const { data: badges } = await adminSupabase
    .from('user_badges')
    .select('id')
    .eq('user_id', user.id);

  const badgesEarned: number = badges?.length ?? 0;

  // Check if user has premium access (paid subscription or active trial)
  const trialEndsAt = user?.trial_ends_at ? new Date(user.trial_ends_at) : null;
  const now = new Date();
  const hasActiveTrial = user?.subscription_tier === 'premium' && 
                        trialEndsAt && 
                        trialEndsAt > now && 
                        !user?.stripe_subscription_id;
  const hasSubscription = !!user?.stripe_subscription_id;
  const isOnPremium = user?.subscription_tier === 'premium' && hasSubscription;
  const hasPremiumAccess: boolean = !!(isOnPremium || hasActiveTrial);

  return {
    actions: uniqueActions,
    completedMap: completedMapObj,
    userId: user.id,
    favoritedActions, // Already filtered above
    currentStreak,
    actionsThisWeek,
    badgesEarned,
    partnerName: user.partner_name || null,
    hasPremiumAccess,
  };
}

export default async function ActionsPage() {
  const session = await getSession();

  if (!session?.user) {
    redirect('/api/auth/login');
  }

  const auth0Id = session.user.sub;
  const { actions, completedMap, userId, favoritedActions, currentStreak, actionsThisWeek, badgesEarned, partnerName, hasPremiumAccess } = await getActions(auth0Id);

  // Filter out favorited actions from main actions list (they'll be shown separately)
  const favoritedActionIds = new Set(favoritedActions.map((fa: any) => fa.id));
  const nonFavoritedActions = actions.filter((action) => !favoritedActionIds.has(action.id));

  // Group actions by theme/category (ensure each action appears only once)
  // Use a Map to ensure uniqueness by ID
  const actionsByTheme: Record<string, Array<typeof actions[0]>> = {};
  const seenActionIds = new Set<string>();
  
  // Define theme display order (by marriage importance)
  const themeOrder = [
    'communication',        // 1. Most foundational
    'intimacy',             // 2. Deepest connection
    'partnership',          // 3. Working together
    'romance',              // 4. Keeping spark alive
    'gratitude',            // 5. Appreciation
    'conflict_resolution',  // 6. Handling disagreements positively
    'reconnection',         // 7. Addressing disconnection
    'quality_time',         // 8. Spending time together (includes outdoor & active)
  ];
  
  // Double-check for duplicates and group by theme (only non-favorited actions)
  const themeDisplayOrder: Record<string, number> = {};
  
  nonFavoritedActions.forEach((action) => {
    // Skip if we've already seen this action ID
    if (seenActionIds.has(action.id)) {
      console.warn(`Duplicate action detected: ${action.name} (${action.id})`);
      return;
    }
    seenActionIds.add(action.id);
    
    // Normalize theme - use theme field if available, otherwise derive from category
    let theme = action.theme;
    if (!theme || theme.trim() === '') {
      // Fallback to category, normalize it
      theme = action.category.toLowerCase().replace(/\s+/g, '_');
    }
    // Normalize theme value (lowercase, no spaces)
    theme = theme.toLowerCase().trim();
    
    if (!actionsByTheme[theme]) {
      actionsByTheme[theme] = [];
    }
    actionsByTheme[theme].push(action);
    
    // Store the display_order for this theme (use the first action's display_order)
    if (action.display_order !== null && action.display_order !== undefined) {
      if (themeDisplayOrder[theme] === undefined || action.display_order < themeDisplayOrder[theme]) {
        themeDisplayOrder[theme] = action.display_order;
      }
    }
  });
  
  // Sort themes by display_order from database, fallback to hardcoded order
  const sortedThemes = Object.keys(actionsByTheme).sort((a, b) => {
    // First try to use display_order from database
    const aOrder = themeDisplayOrder[a];
    const bOrder = themeDisplayOrder[b];
    
    if (aOrder !== undefined && bOrder !== undefined) {
      return aOrder - bOrder;
    }
    if (aOrder !== undefined) return -1;
    if (bOrder !== undefined) return 1;
    
    // Fallback to hardcoded order
    const aIndex = themeOrder.indexOf(a);
    const bIndex = themeOrder.indexOf(b);
    if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex;
    if (aIndex !== -1) return -1;
    if (bIndex !== -1) return 1;
    return a.localeCompare(b);
  });
  
  // Note: Each theme section renders its own ActionsList component

  const completedCount = Object.keys(completedMap).length;

  return (
    <div className="min-h-screen bg-slate-950">
      <DashboardNav />

      <main className="w-full px-3 sm:px-4 md:px-6 lg:px-8 py-6 sm:py-8 md:py-10 overflow-x-hidden">
        <div className="max-w-6xl mx-auto w-full">
          <div className="mb-6 sm:mb-8">
            <h1 className="text-3xl md:text-4xl font-bold mb-2 bg-gradient-to-r from-primary-400 to-primary-600 bg-clip-text text-transparent">
              Actions
            </h1>
            <p className="text-slate-300 text-base md:text-lg mb-4 font-medium">
              Do the thing. Get the badge. Become legendary. Become the Best Husband Ever.
            </p>
            
            {/* Stats and Outstanding Actions - Two Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-[1fr,1fr] gap-4 mb-4 sm:mb-6 lg:items-stretch">
              {/* Quick Stats - Compact */}
              <div className="bg-gradient-to-r from-slate-900/80 via-slate-800/80 to-slate-900/80 border border-slate-700/50 rounded-xl p-3 sm:p-4 backdrop-blur-sm">
                <div className="grid grid-cols-3 gap-2 sm:gap-3">
                  {/* Actions This Week */}
                  <div className="flex flex-col items-center text-center gap-1">
                    <div className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-gradient-to-br from-blue-500/20 to-blue-600/20 border border-blue-500/30 flex items-center justify-center">
                      <span className="text-lg sm:text-xl">📈</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[9px] sm:text-[10px] text-slate-400 font-medium uppercase tracking-wide">Week</p>
                      <p className="text-base sm:text-lg md:text-xl font-bold text-blue-400">
                        {actionsThisWeek}
                      </p>
                      <p className="text-[8px] sm:text-[9px] text-slate-500">actions</p>
                    </div>
                  </div>

                  {/* Current Streak */}
                  <div className="flex flex-col items-center text-center gap-1">
                    <div className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-gradient-to-br from-orange-500/20 to-orange-600/20 border border-orange-500/30 flex items-center justify-center">
                      <span className="text-lg sm:text-xl">🔥</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[9px] sm:text-[10px] text-slate-400 font-medium uppercase tracking-wide">Streak</p>
                      <p className="text-base sm:text-lg md:text-xl font-bold text-orange-400">
                        {currentStreak}
                      </p>
                      <p className="text-[8px] sm:text-[9px] text-slate-500">{currentStreak === 1 ? 'day' : 'days'}</p>
                    </div>
                  </div>

                  {/* Badges Earned */}
                  <div className="flex flex-col items-center text-center gap-1">
                    <div className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-gradient-to-br from-emerald-500/20 to-emerald-600/20 border border-emerald-500/30 flex items-center justify-center">
                      <span className="text-lg sm:text-xl">🏆</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[9px] sm:text-[10px] text-slate-400 font-medium uppercase tracking-wide">Badges</p>
                      <p className="text-base sm:text-lg md:text-xl font-bold text-emerald-400">
                        {badgesEarned}
                      </p>
                      <p className="text-[8px] sm:text-[9px] text-slate-500">earned</p>
                    </div>
                  </div>
                </div>

                {/* Growth Message - Compact */}
                <div className="mt-2 sm:mt-3 pt-2 sm:pt-3 border-t border-slate-700/50">
                  <p className="text-[10px] sm:text-xs font-semibold text-slate-200">
                    {completedCount} total completed
                  </p>
                  <p className="text-[9px] sm:text-[10px] text-slate-400 mt-0.5">
                    Keep showing up! 💪
                  </p>
                </div>
              </div>

              {/* Outstanding Actions */}
              <OutstandingActions userId={userId} hasPremiumAccess={hasPremiumAccess ?? false} />
            </div>
          </div>

          <ActionsPageClient
            allActions={actions}
            completedMap={completedMap}
            userId={userId}
            favoritedActions={favoritedActions}
            partnerName={partnerName}
          />
          
          {/* Action Tooltips - Only show for new users */}
          {completedCount === 0 && (
            <>
              <ActionTooltip
                userId={userId}
                targetSelector="[data-action-search]"
                title="Search Actions"
                content="Use the search bar to find specific actions by keyword or category. You can also use keyboard shortcut Ctrl+K (or Cmd+K on Mac) to quickly open search."
                position="bottom"
              />
              <ActionTooltip
                userId={userId}
                targetSelector="[data-action-favorites]"
                title="Favorite Actions"
                content="Click the star icon on any action card to favorite it. Favorite actions are saved for easy access later. You can view all your favorites by clicking the Favorites button."
                position="bottom"
              />
            </>
          )}
        </div>
        <BackToTop />
      </main>
    </div>
  );
}

