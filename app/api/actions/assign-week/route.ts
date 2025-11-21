import { NextResponse } from 'next/server';
import { getSession } from '@auth0/nextjs-auth0';
import { getSupabaseAdmin } from '@/lib/supabase';

/**
 * Assign 7 days of actions to a user
 * This is called when a user downloads 7 days to calendar or joins a 7-day challenge
 */
export async function POST(request: Request) {
  try {
    const session = await getSession();

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const auth0Id = session.user.sub;
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

    const { days = 7 } = await request.json();

    // Generate actions for the next N days
    const today = new Date();
    const assignedActions = [];

    // Get user's survey data for personalization
    const { data: surveySummary } = await adminSupabase
      .from('survey_summary')
      .select('communication_score, romance_score, partnership_score, intimacy_score, conflict_score')
      .eq('user_id', user.id)
      .single();

    const categoryScores = surveySummary || {};

    for (let i = 0; i < days; i++) {
      const targetDate = new Date(today);
      targetDate.setDate(today.getDate() + i);
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

      // Generate new action using same algorithm
      const action = await generateActionForDate(user.id, dateStr, categoryScores, adminSupabase);
      if (action) {
        assignedActions.push({
          date: dateStr,
          action: {
            id: action.id,
            name: action.name,
            category: action.category,
          },
        });
      }
    }

    return NextResponse.json({
      success: true,
      assigned: assignedActions.length,
      total: days,
      actions: assignedActions,
    });
  } catch (error: any) {
    console.error('Error assigning week of actions:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to assign actions' },
      { status: 500 }
    );
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

