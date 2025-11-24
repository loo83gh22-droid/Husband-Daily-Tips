import { NextResponse } from 'next/server';
import { getSession } from '@auth0/nextjs-auth0';
import { getSupabaseAdmin } from '@/lib/supabase';
import { checkAndAwardBadges } from '@/lib/badges';
import { calculateHealthScore } from '@/lib/health';

export async function POST(request: Request) {
  try {
    const session = await getSession();

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const auth0Id = session.user.sub;
    const { tipId } = await request.json();

    if (!tipId) {
      return NextResponse.json({ error: 'Missing tipId' }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();

    // Look up the internal user id for this Auth0 user
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('auth0_id', auth0Id)
      .single();

    if (userError || !user) {
      console.error('Error fetching user for completion:', userError);
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const today = new Date().toISOString().split('T')[0];

    // Mark the tip as completed for today (or insert if for some reason the row doesn't exist)
    const { error: upsertError } = await supabase
      .from('user_tips')
      .upsert(
        {
          user_id: user.id,
          tip_id: tipId,
          date: today,
          completed: true,
        },
        {
          onConflict: 'user_id,tip_id,date',
        },
      );

    if (upsertError) {
      console.error('Error marking tip as completed:', upsertError);
      return NextResponse.json({ error: 'Failed to mark as completed' }, { status: 500 });
    }

    // Check if this is a recurring tip and mark it as completed
    const { data: tipData } = await supabase
      .from('tips')
      .select('category, is_recurring, recurrence_type')
      .eq('id', tipId)
      .single();

    if (tipData?.is_recurring) {
      // Mark recurring tip as completed
      await supabase
        .from('recurring_tip_completions')
        .update({
          completed: true,
          completed_date: new Date().toISOString(),
        })
        .eq('user_id', user.id)
        .eq('tip_id', tipId)
        .eq('scheduled_date', today);
    }

    // Recompute basic stats to give the client an updated health score
    const { data: tips, error: tipsError } = await supabase
      .from('user_tips')
      .select('date')
      .eq('user_id', user.id)
      .order('date', { ascending: false });

    if (tipsError || !tips) {
      return NextResponse.json({ success: true });
    }

    const totalTips = tips.length;
    const uniqueDays = new Set(tips.map((t) => t.date)).size;

    let streak = 0;
    const todayDate = new Date();
    todayDate.setHours(0, 0, 0, 0);

    for (let i = 0; i < 365; i++) {
      const checkDate = new Date(todayDate);
      checkDate.setDate(todayDate.getDate() - i);
      const dateStr = checkDate.toISOString().split('T')[0];

      if (tips.some((t) => t.date === dateStr)) {
        streak++;
      } else {
        break;
      }
    }

    // Get last action date for decay calculation
    const lastActionDate = tips.length > 0 ? tips[0].date : undefined;

        // Get action completions for badge checking
        // Count each completion instance (not just unique actions)
        const { data: actionCompletions } = await supabase
          .from('user_action_completions')
          .select('actions(requirement_type)')
          .eq('user_id', user.id);

        const actionCounts: Record<string, number> = {};
        actionCompletions?.forEach((ac: any) => {
          const reqType = ac.actions?.requirement_type;
          if (reqType) {
            // Count each instance (multiple completions of same action count multiple times)
            actionCounts[reqType] = (actionCounts[reqType] || 0) + 1;
          }
        });

    // Check for newly earned badges (with action counts)
    const newlyEarned = await checkAndAwardBadges(
      supabase,
      user.id,
      { totalTips, currentStreak: streak, totalDays: uniqueDays, actionCounts },
      tipData?.category,
    );

    // Get baseline health from survey
    const { data: surveySummary } = await supabase
      .from('survey_summary')
      .select('baseline_health')
      .eq('user_id', user.id)
      .single();

    const baselineHealth = surveySummary?.baseline_health || null;

    // Calculate health using new algorithm
    let healthScore = baselineHealth || 50; // Default to 50 if no baseline
    
    try {
      healthScore = await calculateHealthScore({
        baselineHealth,
        userId: user.id,
        supabase,
      });
    } catch (error) {
      console.error('Error calculating health score:', error);
      // Fallback to baseline if calculation fails
      healthScore = baselineHealth || 50;
    }

    return NextResponse.json({
      success: true,
      stats: {
        totalTips,
        currentStreak: streak,
        totalDays: uniqueDays,
        healthScore,
      },
      newlyEarnedBadges: newlyEarned.map((n) => ({
        name: n.badge.name,
        description: n.badge.description,
        icon: n.badge.icon,
        healthBonus: n.healthBonus,
      })),
    });
  } catch (error) {
    console.error('Unexpected error completing tip:', error);
    return NextResponse.json({ error: 'Unexpected error' }, { status: 500 });
  }
}


