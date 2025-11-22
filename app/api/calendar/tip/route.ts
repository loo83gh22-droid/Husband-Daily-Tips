import { NextResponse } from 'next/server';
import { getSession } from '@auth0/nextjs-auth0';
import { supabase } from '@/lib/supabase';
import { format } from 'date-fns';

/**
 * Generate iCal file for a single tip
 */
export async function POST(request: Request) {
  try {
    const session = await getSession();

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const auth0Id = session.user.sub;
    const { tipId, date } = await request.json();

    if (!tipId) {
      return NextResponse.json({ error: 'Missing tipId' }, { status: 400 });
    }

    // Get user
    const { data: user } = await supabase
      .from('users')
      .select('id, email, name, calendar_preferences')
      .eq('auth0_id', auth0Id)
      .single();

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get tip
    const { data: tip } = await supabase.from('tips').select('*').eq('id', tipId).single();

    if (!tip) {
      return NextResponse.json({ error: 'Tip not found' }, { status: 404 });
    }

    // Get user's calendar preferences
    const prefs = (user.calendar_preferences as any) || {};
    const defaultTime = prefs.default_tip_time ?? '09:00'; // Default to 9am
    const timezone = prefs.timezone ?? 'America/New_York';

    // Use provided date or today
    const eventDate = date ? new Date(date) : new Date();
    const [hours, minutes] = defaultTime.split(':').map(Number);
    eventDate.setHours(hours, minutes || 0, 0, 0);

    // Format dates for iCal
    const startDate = format(eventDate, "yyyyMMdd'T'HHmmss");
    const endDate = format(
      new Date(eventDate.getTime() + 30 * 60 * 1000), // 30 minutes duration
      "yyyyMMdd'T'HHmmss",
    );

    // Escape text for iCal
    const escapeText = (text: string) => text.replace(/,/g, '\\,').replace(/\n/g, '\\n');

    // Generate iCal content
    const icalContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Best Husband Ever//EN
CALSCALE:GREGORIAN
METHOD:PUBLISH
BEGIN:VEVENT
UID:${tip.id}-${user.id}-${Date.now()}@husbanddailytips.com
DTSTART;TZID=${timezone}:${startDate}
DTEND;TZID=${timezone}:${endDate}
SUMMARY:${escapeText(tip.title)}
DESCRIPTION:${escapeText(tip.content)}
LOCATION:
STATUS:CONFIRMED
SEQUENCE:0
END:VEVENT
END:VCALENDAR`;

    // Return as iCal file
    return new NextResponse(icalContent, {
      headers: {
        'Content-Type': 'text/calendar; charset=utf-8',
        'Content-Disposition': `attachment; filename="daily-action-${tip.id}.ics"`,
      },
    });
  } catch (error) {
    console.error('Error generating calendar:', error);
    return NextResponse.json({ error: 'Failed to generate calendar' }, { status: 500 });
  }
}

