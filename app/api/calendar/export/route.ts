import { NextResponse } from 'next/server';
import { getSession } from '@auth0/nextjs-auth0';
import { supabase } from '@/lib/supabase';
import { format } from 'date-fns';

/**
 * Generate iCal file for user's recurring tips
 * Users can import this into Google Calendar, Outlook, Apple Calendar, etc.
 */
export async function GET(request: Request) {
  try {
    const session = await getSession();

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const auth0Id = session.user.sub;

    // Get user
    const { data: user } = await supabase
      .from('users')
      .select('id, email, name, calendar_preferences')
      .eq('auth0_id', auth0Id)
      .single();

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get recurring tips
    const { data: recurringTips } = await supabase
      .from('tips')
      .select('*')
      .eq('is_recurring', true);

    if (!recurringTips || recurringTips.length === 0) {
      return NextResponse.json({ error: 'No recurring tips found' }, { status: 404 });
    }

    // Get user's calendar preferences
    const prefs = (user.calendar_preferences as any) || {};
    const checkInDay = prefs.weekly_check_in_day ?? 0; // Default to Sunday
    const checkInTime = prefs.weekly_check_in_time ?? '19:00'; // Default to 7pm
    const timezone = prefs.timezone ?? 'America/New_York';

    // Generate iCal content
    let icalContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Best Husband Ever//EN
CALSCALE:GREGORIAN
METHOD:PUBLISH
`;

    // Add each recurring tip as a calendar event
    for (const tip of recurringTips) {
      if (tip.recurrence_type === 'weekly' && tip.recurrence_day !== null) {
        // Calculate next occurrence
        const today = new Date();
        const dayOfWeek = today.getDay();
        const daysUntilNext = (tip.recurrence_day - dayOfWeek + 7) % 7 || 7;
        const nextDate = new Date(today);
        nextDate.setDate(today.getDate() + daysUntilNext);

        // Parse time
        const [hours, minutes] = checkInTime.split(':').map(Number);
        nextDate.setHours(hours, minutes || 0, 0, 0);

        // Format dates for iCal (YYYYMMDDTHHMMSS)
        const startDate = format(nextDate, "yyyyMMdd'T'HHmmss");
        const endDate = format(
          new Date(nextDate.getTime() + 30 * 60 * 1000), // 30 minutes duration
          "yyyyMMdd'T'HHmmss",
        );

        // Escape text for iCal
        const escapeText = (text: string) => text.replace(/,/g, '\\,').replace(/\n/g, '\\n');

        icalContent += `BEGIN:VEVENT
UID:${tip.id}-${user.id}@husbanddailytips.com
DTSTART;TZID=${timezone}:${startDate}
DTEND;TZID=${timezone}:${endDate}
RRULE:FREQ=WEEKLY;BYDAY=${['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'][tip.recurrence_day]}
SUMMARY:${escapeText(tip.title)}
DESCRIPTION:${escapeText(tip.content)}
LOCATION:
STATUS:CONFIRMED
SEQUENCE:0
END:VEVENT
`;
      }
    }

    icalContent += `END:VCALENDAR`;

    // Return as iCal file
    return new NextResponse(icalContent, {
      headers: {
        'Content-Type': 'text/calendar; charset=utf-8',
        'Content-Disposition': `attachment; filename="best-husband-ever.ics"`,
      },
    });
  } catch (error) {
    console.error('Error generating calendar:', error);
    return NextResponse.json({ error: 'Failed to generate calendar' }, { status: 500 });
  }
}

