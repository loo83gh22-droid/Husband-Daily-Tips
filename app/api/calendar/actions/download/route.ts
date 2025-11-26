import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';
import { format } from 'date-fns';

// Force dynamic rendering since we use request.url
export const dynamic = 'force-dynamic';

/**
 * Generate iCal file for 7 days of future actions
 * Can be accessed via email link with user token
 * GET /api/calendar/actions/download?days=7&token=...
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get('days') || '7');
    const token = searchParams.get('token');
    const userId = searchParams.get('userId');

    // If no token/userId, try to get from session (for dashboard use)
    if (!token && !userId) {
      const { getSession } = await import('@auth0/nextjs-auth0');
      const session = await getSession();
      
      if (!session?.user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      
      const { supabase } = await import('@/lib/supabase');
      const { data: user } = await supabase
        .from('users')
        .select('id, email, name, calendar_preferences')
        .eq('auth0_id', session.user.sub)
        .single();
      
      if (!user) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }

      return generateCalendarFile(user.id, days, user);
    }

    // For email links: verify token and get user
    // For now, we'll use userId directly (in production, use proper token verification)
    if (!userId) {
      return NextResponse.json({ error: 'Invalid link' }, { status: 400 });
    }

    const adminSupabase = getSupabaseAdmin();
    const { data: user, error: userError } = await adminSupabase
      .from('users')
      .select('id, email, name, calendar_preferences')
      .eq('id', userId)
      .single();

    if (userError || !user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return generateCalendarFile(user.id, days, user);
  } catch (error) {
    console.error('Error generating calendar file:', error);
    return NextResponse.json({ error: 'Failed to generate calendar' }, { status: 500 });
  }
}

async function generateCalendarFile(userId: string, days: number, user: any) {
  const adminSupabase = getSupabaseAdmin();

  // Get user's calendar preferences
  const prefs = (user.calendar_preferences as any) || {};
  const defaultTime = prefs.default_tip_time ?? '09:00'; // Default to 9am
  const timezone = prefs.timezone ?? 'America/New_York';

  // Check if user has an active challenge
  const { data: activeChallenge, error: challengeError } = await adminSupabase
    .from('user_challenges')
    .select(`
      *,
      challenges (
        *,
        challenge_actions (
          day_number,
          actions (
            id,
            name,
            description,
            icon,
            benefit
          )
        )
      )
    `)
    .eq('user_id', userId)
    .eq('completed', false)
    .order('joined_date', { ascending: false })
    .limit(1)
    .maybeSingle(); // Use maybeSingle() instead of single() to avoid error if no challenge found

  const actions = [];
  const today = new Date();

  // If user has an active challenge, use challenge actions
  if (activeChallenge?.challenges?.challenge_actions) {
    const challenge = activeChallenge.challenges;
    const challengeActions = challenge.challenge_actions || [];
    const joinedDate = new Date(activeChallenge.joined_date);

    for (let i = 0; i < days; i++) {
      const targetDate = new Date(joinedDate);
      targetDate.setDate(joinedDate.getDate() + i);
      const dateStr = targetDate.toISOString().split('T')[0];
      const dayNumber = i + 1;

      // Find challenge action for this day
      const challengeAction = challengeActions.find((ca: any) => ca.day_number === dayNumber);
      
      if (challengeAction?.actions) {
        actions.push({
          ...challengeAction.actions,
          date: dateStr,
        });
      }
    }
  } else {
    // No active challenge - generate regular actions
    // Get user's survey data for personalization
    const { data: surveySummary } = await adminSupabase
      .from('survey_summary')
      .select('communication_score, romance_score, partnership_score, intimacy_score, conflict_score')
      .eq('user_id', userId)
      .single();

    const categoryScores = surveySummary || {};

    for (let i = 0; i < days; i++) {
      const targetDate = new Date(today);
      targetDate.setDate(today.getDate() + i);
      const dateStr = targetDate.toISOString().split('T')[0];

      // Check if action already exists
      const { data: existingAction } = await adminSupabase
        .from('user_daily_actions')
        .select('*, actions(*)')
        .eq('user_id', userId)
        .eq('date', dateStr)
        .single();

      if (existingAction && existingAction.actions) {
        // Use existing action
        actions.push({
          ...existingAction.actions,
          date: dateStr,
        });
      } else {
        // Generate new action using same algorithm as getTomorrowAction
        const action = await generateActionForDate(userId, dateStr, categoryScores, adminSupabase);
        if (action) {
          actions.push({
            ...action,
            date: dateStr,
          });
        }
      }
    }
  }

  // Generate iCal content
  let icalContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Best Husband Ever//EN
CALSCALE:GREGORIAN
METHOD:PUBLISH
`;

  // Escape text for iCal
  const escapeText = (text: string) => text.replace(/,/g, '\\,').replace(/\n/g, '\\n').replace(/;/g, '\\;');

  for (const action of actions) {
    const eventDate = new Date(action.date);
    const [hours, minutes] = defaultTime.split(':').map(Number);
    eventDate.setHours(hours, minutes || 0, 0, 0);

    const startDate = format(eventDate, "yyyyMMdd'T'HHmmss");
    const endDate = format(
      new Date(eventDate.getTime() + 30 * 60 * 1000), // 30 minutes duration
      "yyyyMMdd'T'HHmmss",
    );

    const description = action.description || '';
    const benefit = action.benefit ? `\n\nWhy this matters: ${action.benefit}` : '';

    icalContent += `BEGIN:VEVENT
UID:${action.id}-${userId}-${action.date}@besthusbandever.com
DTSTART;TZID=${timezone}:${startDate}
DTEND;TZID=${timezone}:${endDate}
SUMMARY:${escapeText(action.icon ? `${action.icon} ${action.name}` : action.name)}
DESCRIPTION:${escapeText(description + benefit)}
LOCATION:
STATUS:CONFIRMED
SEQUENCE:0
END:VEVENT
`;
  }

  icalContent += `END:VCALENDAR`;

  // If no actions were generated, return an error
  if (actions.length === 0) {
    return NextResponse.json(
      { error: 'No actions available to download. Please try again later.' },
      { status: 404 }
    );
  }

  // Return as iCal file
  return new NextResponse(icalContent, {
    headers: {
      'Content-Type': 'text/calendar; charset=utf-8',
      'Content-Disposition': `attachment; filename="7-day-event-actions.ics"`,
    },
  });
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

