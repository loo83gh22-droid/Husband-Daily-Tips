import { NextResponse } from 'next/server';
import { getSession } from '@auth0/nextjs-auth0';
import { getSupabaseAdmin } from '@/lib/supabase';
import crypto from 'crypto';

// Force dynamic rendering since we use cookies for authentication
export const dynamic = 'force-dynamic';

/**
 * Generate a secure calendar feed URL for paid users
 * This creates a token-based URL that can be subscribed to in calendar apps
 */
export async function GET(request: Request) {
  try {
    const session = await getSession();

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const auth0Id = session.user.sub;
    const adminSupabase = getSupabaseAdmin();

    // Get user with subscription tier
    const { data: user, error: userError } = await adminSupabase
      .from('users')
      .select('id, subscription_tier, calendar_preferences')
      .eq('auth0_id', auth0Id)
      .single();

    if (userError || !user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Only allow paid users
    if (user.subscription_tier === 'free') {
      return NextResponse.json({ 
        error: 'Calendar feed subscription is only available for paid users',
        requiresUpgrade: true 
      }, { status: 403 });
    }

    // Check if auto-add is enabled
    const prefs = (user.calendar_preferences as any) || {};
    if (!prefs.auto_add_to_calendar) {
      return NextResponse.json({ 
        error: 'Please enable auto-add to calendar first',
        requiresEnable: true 
      }, { status: 400 });
    }

    // Generate a secure token (in production, store this in database with expiration)
    // For now, we'll use a simple hash of user ID + secret
    const secret = process.env.CALENDAR_FEED_SECRET || 'default-secret-change-in-production';
    const token = crypto
      .createHash('sha256')
      .update(`${user.id}-${secret}`)
      .digest('hex')
      .substring(0, 32);

    const baseUrl = process.env.AUTH0_BASE_URL || 'https://besthusbandever.com';
    const feedUrl = `${baseUrl}/api/calendar/feed?userId=${user.id}&token=${token}`;

    return NextResponse.json({ 
      feedUrl,
      instructions: {
        google: `1. Open Google Calendar
2. Click the "+" next to "Other calendars"
3. Select "From URL"
4. Paste this URL and click "Add calendar"`,
        outlook: `1. Open Outlook Calendar
2. Click "Add calendar" → "Subscribe from web"
3. Paste this URL and click "Import"`,
        apple: `1. Open Calendar app (macOS or iOS)
2. Go to File → New Calendar Subscription
3. Paste this URL and click "Subscribe"
4. The calendar will sync automatically`
      }
    });
  } catch (error) {
    console.error('Error generating calendar feed URL:', error);
    return NextResponse.json({ error: 'Failed to generate feed URL' }, { status: 500 });
  }
}

