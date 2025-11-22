import { NextResponse } from 'next/server';
import { getSession } from '@auth0/nextjs-auth0';
import { getSupabaseAdmin } from '@/lib/supabase';
import { calculateBadgeProgress } from '@/lib/badges';

async function getUserStats(userId: string, adminSupabase: ReturnType<typeof getSupabaseAdmin>) {
  // Get tips for stats
  const { data: tips } = await adminSupabase
    .from('user_tips')
    .select('date')
    .eq('user_id', userId)
    .order('date', { ascending: false });

  const totalTips = tips?.length || 0;
  const uniqueDays = new Set(tips?.map((t) => t.date)).size;

  // Calculate streak
  let streak = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let i = 0; i < 365; i++) {
    const checkDate = new Date(today);
    checkDate.setDate(today.getDate() - i);
    const dateStr = checkDate.toISOString().split('T')[0];

    if (tips?.some((t) => t.date === dateStr)) {
      streak++;
    } else {
      break;
    }
  }

  // Get action completions for actionCounts
  const { data: actionCompletions } = await adminSupabase
    .from('user_action_completions')
    .select('actions(requirement_type)')
    .eq('user_id', userId);

  const actionCounts: Record<string, number> = {};
  actionCompletions?.forEach((ac: any) => {
    const reqType = ac.actions?.requirement_type;
    if (reqType) {
      actionCounts[reqType] = (actionCounts[reqType] || 0) + 1;
    }
  });

  return {
    totalTips,
    currentStreak: streak,
    totalDays: uniqueDays,
    actionCounts,
  };
}

export async function GET(request: Request) {
  try {
    const session = await getSession();

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const auth0Id = session.user.sub;
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    // Use admin client to bypass RLS (Auth0 context isn't set)
    const adminSupabase = getSupabaseAdmin();

    // Get user
    const { data: user, error: userError } = await adminSupabase
      .from('users')
      .select('id')
      .eq('auth0_id', auth0Id)
      .single();

    if (userError || !user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get user stats for progress calculation
    const stats = await getUserStats(user.id, adminSupabase);

    // Get all badges - use DISTINCT ON to prevent duplicates
    const { data: allBadges, error: badgesError } = await adminSupabase
      .from('badges')
      .select('*')
      .order('badge_type', { ascending: true })
      .order('requirement_value', { ascending: true });

    if (badgesError || !allBadges) {
      return NextResponse.json({ error: 'Failed to fetch badges' }, { status: 500 });
    }

    // Deduplicate badges by ID (in case of database duplicates)
    const uniqueBadges = Array.from(
      new Map(allBadges.map((badge) => [badge.id, badge])).values()
    );

    // Get user's earned badges - deduplicate by badge_id (keep most recent earned_at)
    const { data: earnedBadges, error: earnedError } = await adminSupabase
      .from('user_badges')
      .select('badge_id, earned_at')
      .eq('user_id', user.id)
      .order('earned_at', { ascending: false });

    // Deduplicate earned badges by badge_id (in case of duplicates)
    const earnedMap = new Map<string, string>();
    earnedBadges?.forEach((eb) => {
      // Only set if not already in map (keeps the first/most recent one)
      if (!earnedMap.has(eb.badge_id)) {
        earnedMap.set(eb.badge_id, eb.earned_at);
      }
    });

    // Calculate progress for each badge and combine with earned status
    const badgesWithProgress = await Promise.all(
      uniqueBadges.map(async (badge) => {
        const earned_at = earnedMap.get(badge.id);
        let progress = null;

        // Only calculate progress for unearned badges
        if (!earned_at) {
          progress = await calculateBadgeProgress(adminSupabase, user.id, badge, stats);
        }

        return {
          ...badge,
          earned_at: earned_at || undefined,
          progress,
        };
      }),
    );

    return NextResponse.json({ badges: badgesWithProgress });
  } catch (error) {
    console.error('Unexpected error fetching badges:', error);
    return NextResponse.json({ error: 'Unexpected error' }, { status: 500 });
  }
}

