import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';
import { format } from 'date-fns';
import crypto from 'crypto';

// Force dynamic rendering since we use request.url
export const dynamic = 'force-dynamic';

/**
 * Public calendar feed (iCal format) for users with auto-add enabled
 * GET /api/calendar/feed?userId=xxx&token=xxx
 * 
 * Users can subscribe to this URL in their calendar app for automatic syncing
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const token = searchParams.get('token');

    if (!userId || !token) {
      return NextResponse.json({ error: 'Missing userId or token' }, { status: 400 });
    }

    // Verify token
    const secret = process.env.CALENDAR_FEED_SECRET || 'default-secret-change-in-production';
    const expectedToken = crypto
      .createHash('sha256')
      .update(`${userId}-${secret}`)
      .digest('hex')
      .substring(0, 32);

    if (token !== expectedToken) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const adminSupabase = getSupabaseAdmin();
    const { data: user, error: userError } = await adminSupabase
      .from('users')
      .select('id, email, name, calendar_preferences, subscription_tier, has_kids, kids_live_with_you')
      .eq('id', userId)
      .single();

    if (userError || !user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Only allow paid users to use calendar feed
    if (user.subscription_tier === 'free') {
      return NextResponse.json({ error: 'Calendar feed is only available for paid users' }, { status: 403 });
    }

    // Check if auto-add is enabled
    const prefs = (user.calendar_preferences as any) || {};
    if (!prefs.auto_add_to_calendar) {
      return NextResponse.json({ error: 'Auto-add to calendar is not enabled' }, { status: 403 });
    }

    // Get user's upcoming actions (next 90 days)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const futureDate = new Date(today);
    futureDate.setDate(today.getDate() + 90);
    const futureDateStr = futureDate.toISOString().split('T')[0];

    // Get existing actions
    const { data: existingActions } = await adminSupabase
      .from('user_daily_actions')
      .select('*, actions(*)')
      .eq('user_id', userId)
      .gte('date', today.toISOString().split('T')[0])
      .lte('date', futureDateStr)
      .order('date', { ascending: true });

           // Get user's survey data for generating future actions
           const { data: surveySummary } = await adminSupabase
             .from('survey_summary')
             .select('communication_score, romance_score, partnership_score, intimacy_score, conflict_score')
             .eq('user_id', userId)
             .single();

           const categoryScores = surveySummary || {};
           const defaultTime = prefs.default_tip_time ?? '09:00';
           const timezone = prefs.timezone ?? 'America/New_York';

           // Get user profile for filtering kid-related actions
           const userProfile = {
             has_kids: (user as any).has_kids ?? null,
             kids_live_with_you: (user as any).kids_live_with_you ?? null,
           };

           // Generate actions for dates that don't have them yet
           const actions: any[] = [];
           const actionMap = new Map();
           
           // Add existing actions
           if (existingActions) {
             for (const ua of existingActions) {
               if (ua.actions) {
                 const action = Array.isArray(ua.actions) ? ua.actions[0] : ua.actions;
                 actionMap.set(ua.date, {
                   ...action,
                   date: ua.date,
                 });
               }
             }
           }

           // Generate missing actions
           for (let i = 0; i < 90; i++) {
             const targetDate = new Date(today);
             targetDate.setDate(today.getDate() + i);
             const dateStr = targetDate.toISOString().split('T')[0];

             if (!actionMap.has(dateStr)) {
               const action = await generateActionForDate(userId, dateStr, categoryScores, adminSupabase, userProfile);
               if (action) {
                 actionMap.set(dateStr, { ...action, date: dateStr });
               }
             }
           }

    // Convert map to array
    const allActions = Array.from(actionMap.values());

    // Generate iCal content
    let icalContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Best Husband Ever//EN
CALSCALE:GREGORIAN
METHOD:PUBLISH
X-WR-CALNAME:Best Husband Ever - Daily Actions
X-WR-CALDESC:Your daily relationship actions
REFRESH-INTERVAL;VALUE=DURATION:PT1H
X-PUBLISHED-TTL:PT1H
`;

    // Escape text for iCal
    const escapeText = (text: string) => text.replace(/,/g, '\\,').replace(/\n/g, '\\n').replace(/;/g, '\\;');

    for (const action of allActions) {
      const eventDate = new Date(action.date + 'T' + defaultTime + ':00');
      const endDate = new Date(eventDate.getTime() + 30 * 60 * 1000); // 30 minutes duration

      // Format dates in UTC for iCal (more compatible)
      const formatDateUTC = (date: Date) => {
        const year = date.getUTCFullYear();
        const month = String(date.getUTCMonth() + 1).padStart(2, '0');
        const day = String(date.getUTCDate()).padStart(2, '0');
        const hours = String(date.getUTCHours()).padStart(2, '0');
        const minutes = String(date.getUTCMinutes()).padStart(2, '0');
        const seconds = String(date.getUTCSeconds()).padStart(2, '0');
        return `${year}${month}${day}T${hours}${minutes}${seconds}Z`;
      };

      const startDateStr = formatDateUTC(eventDate);
      const endDateStr = formatDateUTC(endDate);
      const dtstamp = formatDateUTC(new Date());

      const description = action.description || '';
      const benefit = action.benefit ? `\n\nWhy this matters: ${action.benefit}` : '';

      icalContent += `BEGIN:VEVENT
UID:${action.id}-${userId}-${action.date}@besthusbandever.com
DTSTART:${startDateStr}
DTEND:${endDateStr}
SUMMARY:${escapeText(action.icon ? `${action.icon} ${action.name}` : action.name)}
DESCRIPTION:${escapeText(description + benefit)}
LOCATION:
STATUS:CONFIRMED
SEQUENCE:0
DTSTAMP:${dtstamp}
END:VEVENT
`;
    }

    icalContent += `END:VCALENDAR`;

    // Return as iCal file with proper headers for calendar subscription
    return new NextResponse(icalContent, {
      headers: {
        'Content-Type': 'text/calendar; charset=utf-8',
        'Content-Disposition': 'inline; filename="best-husband-actions.ics"',
        'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
      },
    });
  } catch (error) {
    console.error('Error generating calendar feed:', error);
    return NextResponse.json({ error: 'Failed to generate calendar feed' }, { status: 500 });
  }
}

async function generateActionForDate(
  userId: string,
  dateStr: string,
  categoryScores: any,
  adminSupabase: any,
  userProfile?: { has_kids?: boolean | null; kids_live_with_you?: boolean | null },
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

  // Filter out kid-related actions if user doesn't have kids (especially if they don't live with them)
  if (actions && userProfile) {
    const hasKids = userProfile.has_kids === true;
    const kidsLiveWithYou = userProfile.kids_live_with_you === true;
    
    // If user explicitly said they don't have kids, or if they have kids but they don't live with them,
    // filter out actions that are clearly kid/family-focused
    if (!hasKids || (hasKids && !kidsLiveWithYou)) {
      const kidKeywords = ['kid', 'child', 'children', 'family', 'parent', 'bedtime', 'school', 'homework', 'playground'];
      actions = actions.filter((action: any) => {
        const actionText = `${action.name || ''} ${action.description || ''} ${action.benefit || ''}`.toLowerCase();
        // Check if action contains kid-related keywords
        const isKidRelated = kidKeywords.some(keyword => actionText.includes(keyword));
        // If user doesn't have kids at all, filter out all kid-related actions
        // If user has kids but they don't live with them, be more lenient (only filter obvious family activities)
        if (!hasKids) {
          return !isKidRelated;
        } else {
          // If kids don't live with them, filter out actions that require daily presence (bedtime, school, etc.)
          const requiresDailyPresence = ['bedtime', 'school', 'homework', 'playground'].some(keyword => actionText.includes(keyword));
          return !requiresDailyPresence;
        }
      });
    }
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

  // Save to user_daily_actions
  await adminSupabase.from('user_daily_actions').insert({
    user_id: userId,
    action_id: randomAction.id,
    date: dateStr,
  });

  return randomAction;
}

