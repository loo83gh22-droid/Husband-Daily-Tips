import { NextResponse } from 'next/server';
import { getSession } from '@auth0/nextjs-auth0';
import { supabase } from '@/lib/supabase';

/**
 * Generate calendar links for automatic calendar integration
 * Returns Google Calendar, Outlook, and iCal links for all 7 days of actions
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const days = parseInt(searchParams.get('days') || '7');

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's active challenge to get actions
    const { data: activeChallenge } = await supabase
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
              description
            )
          )
        )
      `)
      .eq('user_id', userId)
      .eq('completed', false)
      .order('joined_date', { ascending: false })
      .limit(1)
      .single();

    if (!activeChallenge?.challenges) {
      return NextResponse.json({ error: 'No active challenge found' }, { status: 404 });
    }

    const challenge = activeChallenge.challenges;
    const challengeActions = challenge.challenge_actions || [];
    const joinedDate = new Date(activeChallenge.joined_date);
    
    // Get user preferences for time
    const { data: userPrefs } = await supabase
      .from('user_preferences')
      .select('default_action_time, timezone')
      .eq('user_id', userId)
      .single();

    const defaultTime = userPrefs?.default_action_time || '09:00';
    const timezone = userPrefs?.timezone || 'America/New_York';

    // Build calendar events for each day
    const calendarEvents = challengeActions
      .filter((ca: any) => ca.day_number <= days)
      .map((ca: any, index: number) => {
        const action = ca.actions;
        const eventDate = new Date(joinedDate);
        eventDate.setDate(joinedDate.getDate() + (ca.day_number - 1));

        // Format dates for calendar URLs (YYYYMMDDTHHmmss)
        const startDate = new Date(eventDate);
        const [hours, minutes] = defaultTime.split(':');
        startDate.setHours(parseInt(hours), parseInt(minutes), 0);

        const endDate = new Date(startDate);
        endDate.setHours(startDate.getHours() + 1); // 1 hour event

        const startDateStr = startDate.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
        const endDateStr = endDate.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';

        return {
          title: `Day ${ca.day_number}: ${action.name}`,
          description: action.description || '',
          startDate: startDateStr,
          endDate: endDateStr,
          location: '',
        };
      });

    // Generate Google Calendar URL (opens in browser)
    const googleCalendarUrl = generateGoogleCalendarUrl(calendarEvents);

    // Generate Outlook Calendar URL (opens in browser)
    const outlookCalendarUrl = generateOutlookCalendarUrl(calendarEvents[0]); // Outlook handles one at a time

    // Generate iCal download link (fallback)
    const baseUrl = process.env.AUTH0_BASE_URL || 'https://besthusbandever.com';
    const icalUrl = `${baseUrl}/api/calendar/actions/download?days=${days}&userId=${userId}`;

    return NextResponse.json({
      googleCalendar: googleCalendarUrl,
      outlookCalendar: outlookCalendarUrl,
      icalDownload: icalUrl,
      events: calendarEvents,
    });
  } catch (error) {
    console.error('Error generating calendar links:', error);
    return NextResponse.json({ error: 'Failed to generate calendar links' }, { status: 500 });
  }
}

function generateGoogleCalendarUrl(events: any[]): string {
  // Google Calendar can handle multiple events by opening them one at a time
  // We'll return the first event's URL and add instructions
  if (events.length === 0) return '';

  const firstEvent = events[0];
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: firstEvent.title,
    dates: `${firstEvent.startDate}/${firstEvent.endDate}`,
    details: firstEvent.description || '',
    sf: 'true',
    output: 'xml',
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

function generateOutlookCalendarUrl(event: any): string {
  const params = new URLSearchParams({
    subject: event.title,
    startdt: event.startDate,
    enddt: event.endDate,
    body: event.description || '',
    location: event.location || '',
  });

  return `https://outlook.live.com/calendar/0/deeplink/compose?${params.toString()}`;
}

