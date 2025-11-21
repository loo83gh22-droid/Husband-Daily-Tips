import { NextResponse } from 'next/server';
import { getSession } from '@auth0/nextjs-auth0';
import { supabase } from '@/lib/supabase';

/**
 * Join a weekly challenge
 */
export async function POST(request: Request) {
  try {
    const session = await getSession();

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const auth0Id = session.user.sub;
    const { challengeId } = await request.json();

    if (!challengeId) {
      return NextResponse.json({ error: 'Missing challengeId' }, { status: 400 });
    }

    // Get user
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('auth0_id', auth0Id)
      .single();

    if (userError || !user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if challenge exists and is active
    const { data: challenge, error: challengeError } = await supabase
      .from('challenges')
      .select('*')
      .eq('id', challengeId)
      .eq('is_active', true)
      .single();

    if (challengeError || !challenge) {
      return NextResponse.json({ error: 'Challenge not found or not active' }, { status: 404 });
    }

    const today = new Date().toISOString().split('T')[0];

    // Check if user already joined
    const { data: existing } = await supabase
      .from('user_challenges')
      .select('id')
      .eq('user_id', user.id)
      .eq('challenge_id', challengeId)
      .single();

    if (existing) {
      return NextResponse.json({ success: true, message: 'Already joined challenge' });
    }

    // Join challenge
    const { data: userChallenge, error: joinError } = await supabase
      .from('user_challenges')
      .insert({
        user_id: user.id,
        challenge_id: challengeId,
        joined_date: today,
        completed_days: 0,
        completed: false,
      })
      .select()
      .single();

    if (joinError) {
      console.error('Error joining challenge:', joinError);
      return NextResponse.json({ error: 'Failed to join challenge' }, { status: 500 });
    }

    // If this is a 7-day challenge, automatically assign 7 days of actions
    // This ensures the challenge actions are locked in and take precedence
    if (challenge && challenge.duration_days === 7) {
      try {
        const { getSupabaseAdmin } = await import('@/lib/supabase');
        const adminSupabase = getSupabaseAdmin();

        // Get user's survey data for personalization
        const { data: surveySummary } = await adminSupabase
          .from('survey_summary')
          .select('communication_score, romance_score, partnership_score, intimacy_score, conflict_score')
          .eq('user_id', user.id)
          .single();

        const categoryScores = surveySummary || {};
        let assignedCount = 0;

        for (let i = 0; i < 7; i++) {
          const targetDate = new Date(today);
          targetDate.setDate(new Date(today).getDate() + i);
          const dateStr = targetDate.toISOString().split('T')[0];

          // Check if action already exists
          const { data: existingAction } = await adminSupabase
            .from('user_daily_actions')
            .select('action_id')
            .eq('user_id', user.id)
            .eq('date', dateStr)
            .single();

          if (existingAction) {
            // Already assigned, skip
            continue;
          }

          // Generate action using same algorithm
          const action = await generateActionForDate(user.id, dateStr, categoryScores, adminSupabase);
          if (action) {
            assignedCount++;
          }
        }

        console.log(`Assigned ${assignedCount} actions for 7-day challenge`);
      } catch (assignError) {
        // Don't fail challenge join if action assignment fails
        console.error('Error assigning actions for challenge:', assignError);
      }
    }

    // Check if this is their first challenge (for badge)
    const { data: allChallenges } = await supabase
      .from('user_challenges')
      .select('id')
      .eq('user_id', user.id);

    if (allChallenges && allChallenges.length === 1) {
      // First challenge - award "Challenge Starter" badge
      const { data: badge } = await supabase
        .from('badges')
        .select('id')
        .eq('name', 'Challenge Starter')
        .single();

      if (badge) {
        await supabase.from('user_badges').insert({
          user_id: user.id,
          badge_id: badge.id,
          earned_at: new Date().toISOString(),
        });
      }
    }

    return NextResponse.json({ success: true, userChallenge });
  } catch (error) {
    console.error('Unexpected error joining challenge:', error);
    return NextResponse.json({ error: 'Unexpected error' }, { status: 500 });
  }
}

async function generateActionForDate(
  userId: string,
  dateStr: string,
  categoryScores: any,
  adminSupabase: any,
): Promise<any> {
  // Get actions user hasn't seen in the last 30 days
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const thirtyDaysAgoStr = thirtyDaysAgo.toISOString().split('T')[0];

  const { data: recentActions } = await adminSupabase
    .from('user_daily_actions')
    .select('action_id')
    .eq('user_id', userId)
    .gte('date', thirtyDaysAgoStr);

  const seenActionIds = recentActions?.map((ra: any) => ra.action_id) || [];

  // Get available actions
  let { data: actions } = await adminSupabase
    .from('actions')
    .select('*')
    .limit(100);

  // Filter out actions seen in last 30 days
  if (actions && seenActionIds.length > 0) {
    actions = actions.filter((action: any) => !seenActionIds.includes(action.id));
  }

  // Personalize action selection based on survey results
  if (actions && categoryScores && actions.length > 0) {
    const categoryMapping: Record<string, string> = {
      'communication': 'Communication',
      'romance': 'Romance',
      'partnership': 'Partnership',
      'intimacy': 'Intimacy',
      'conflict': 'Communication',
      'connection': 'Roommate Syndrome Recovery',
    };

    const connectionScore = categoryScores.connection_score || categoryScores.intimacy_score || 50;

    const scores = [
      { category: 'communication', score: categoryScores.communication_score || 50 },
      { category: 'romance', score: categoryScores.romance_score || 50 },
      { category: 'partnership', score: categoryScores.partnership_score || 50 },
      { category: 'intimacy', score: categoryScores.intimacy_score || 50 },
      { category: 'conflict', score: categoryScores.conflict_score || 50 },
      { category: 'connection', score: connectionScore },
    ];

    scores.sort((a, b) => a.score - b.score);
    const lowestCategory = scores[0];
    const targetCategory = categoryMapping[lowestCategory.category];

    const priorityActions = actions.filter((a: any) => a.category === targetCategory);
    if (priorityActions.length > 0) {
      // 70% chance to pick from priority category, 30% random
      if (Math.random() < 0.7) {
        actions = priorityActions;
      }
    }
  }

  if (!actions || actions.length === 0) {
    // Fallback: get any action
    const { data: allActions } = await adminSupabase
      .from('actions')
      .select('*')
      .limit(100);

    if (!allActions || allActions.length === 0) {
      return null;
    }
    actions = allActions;
  }

  const randomAction = actions[Math.floor(Math.random() * actions.length)];

  // Save to user_daily_actions (this ensures algorithm respects pre-assigned actions)
  await adminSupabase.from('user_daily_actions').insert({
    user_id: userId,
    action_id: randomAction.id,
    date: dateStr,
  });

  return randomAction;
}

