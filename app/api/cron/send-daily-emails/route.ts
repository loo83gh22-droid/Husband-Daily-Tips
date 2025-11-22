import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';

// Force dynamic rendering since we use request.headers
export const dynamic = 'force-dynamic';

/**
 * Cron job endpoint to send daily action emails at 7pm in each user's timezone
 * 
 * This should be called by Vercel Cron or an external cron service.
 * Schedule: Run every hour, and this endpoint will determine which users should receive emails
 * based on their timezone (7pm in their local time).
 * 
 * Vercel Cron config (vercel.json):
 * {
 *   "crons": [{
 *     "path": "/api/cron/send-daily-emails",
 *     "schedule": "0 * * * *"  // Every hour
 *   }]
 * }
 */
export async function GET(request: Request) {
  try {
    // Verify this is called from Vercel Cron or with proper auth
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;
    
    // Allow Vercel Cron (no auth header) or bearer token
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      // Check if it's from Vercel Cron (has specific headers)
      const vercelCron = request.headers.get('x-vercel-cron');
      if (!vercelCron) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
    }

    const adminSupabase = getSupabaseAdmin();
    const now = new Date();

    // Get all users with email notifications enabled (we'll add this field later)
    // For now, get all users
    const { data: users, error: usersError } = await adminSupabase
      .from('users')
      .select('id, email, timezone')
      .not('email', 'is', null);

    if (usersError) {
      console.error('Error fetching users:', usersError);
      return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
    }

    if (!users || users.length === 0) {
      return NextResponse.json({ message: 'No users found' });
    }

    // For each user, check if it's 7pm in their timezone
    const usersToEmail: string[] = [];

    for (const user of users) {
      const timezone = user.timezone || 'America/New_York'; // Default timezone
      
      try {
        // Get current time in user's timezone
        const userTime = new Date(now.toLocaleString('en-US', { timeZone: timezone }));
        const hour = userTime.getHours();

        // If it's 7pm (19:00) in their timezone, add to list
        if (hour === 19) {
          usersToEmail.push(user.id);
        }
      } catch (error) {
        console.error(`Error processing timezone for user ${user.id}:`, error);
        // Skip this user if timezone is invalid
      }
    }

    if (usersToEmail.length === 0) {
      return NextResponse.json({ 
        message: 'No users to email at this time',
        currentHour: now.getHours(),
        usersChecked: users.length,
      });
    }

    // Send emails (in production, you might want to queue these)
    const results = [];
    for (const userId of usersToEmail) {
      try {
        const response = await fetch(`${process.env.AUTH0_BASE_URL || 'http://localhost:3000'}/api/email/send-daily-action`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.CRON_SECRET || 'dev-secret'}`,
          },
          body: JSON.stringify({ userId }),
        });

        const data = await response.json();
        results.push({ userId, success: response.ok, data });
      } catch (error: any) {
        console.error(`Error sending email to user ${userId}:`, error);
        results.push({ userId, success: false, error: error.message });
      }
    }

    return NextResponse.json({
      message: `Processed ${usersToEmail.length} users`,
      results,
      timestamp: now.toISOString(),
    });
  } catch (error: any) {
    console.error('Error in cron job:', error);
    return NextResponse.json({ error: error.message || 'Unexpected error' }, { status: 500 });
  }
}

