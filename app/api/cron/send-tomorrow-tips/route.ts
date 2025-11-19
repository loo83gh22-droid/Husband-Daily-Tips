import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';
import { sendTomorrowTipEmail } from '@/lib/email';

/**
 * Cron endpoint to send tomorrow's tips at 12pm
 * 
 * Set up in Vercel:
 * 1. Go to Project Settings → Cron Jobs
 * 2. Add new cron job:
 *    - Path: /api/cron/send-tomorrow-tips
 *    - Schedule: 0 12 * * * (12pm daily)
 * 
 * Or use vercel.json:
 * {
 *   "crons": [{
 *     "path": "/api/cron/send-tomorrow-tips",
 *     "schedule": "0 12 * * *"
 *   }]
 * }
 */

export async function GET(request: Request) {
  // Verify this is a cron request (Vercel adds a header)
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Check environment variables
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.error('SUPABASE_SERVICE_ROLE_KEY not configured');
      return NextResponse.json(
        { error: 'Database not configured', message: 'SUPABASE_SERVICE_ROLE_KEY missing' },
        { status: 500 }
      );
    }

    if (!process.env.RESEND_API_KEY) {
      console.error('RESEND_API_KEY not configured');
      return NextResponse.json(
        { error: 'Email service not configured', message: 'RESEND_API_KEY missing' },
        { status: 500 }
      );
    }

    const supabase = getSupabaseAdmin();

    // Get all active users
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, email, name')
      .not('email', 'is', null);

    if (usersError) {
      console.error('Error fetching users:', usersError);
      return NextResponse.json(
        { error: 'Failed to fetch users', details: usersError.message },
        { status: 500 }
      );
    }

    if (!users || users.length === 0) {
      console.warn('No users found in database');
      return NextResponse.json({
        success: true,
        sent: 0,
        errors: 0,
        total: 0,
        message: 'No users found in database',
      });
    }

    // Get tomorrow's date
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];

    let sentCount = 0;
    let errorCount = 0;

    // For each user, get a tip for tomorrow
    for (const user of users) {
      try {
        // Check if user already has a tip for tomorrow
        const { data: existingTip } = await supabase
          .from('user_tips')
          .select('tip_id, tips(*)')
          .eq('user_id', user.id)
          .eq('date', tomorrowStr)
          .single();

        let tip;
        if (existingTip?.tips) {
          tip = existingTip.tips;
        } else {
          // Get a random tip (all accessible during testing)
          const { data: tips } = await supabase
            .from('tips')
            .select('*')
            .limit(100);

          if (!tips || tips.length === 0) {
            console.error(`No tips available for user ${user.id}`);
            errorCount++;
            continue;
          }

          tip = tips[Math.floor(Math.random() * tips.length)];

          // Pre-assign tip for tomorrow
          await supabase.from('user_tips').insert({
            user_id: user.id,
            tip_id: tip.id,
            date: tomorrowStr,
            completed: false,
          });
        }

        // Send email
        const success = await sendTomorrowTipEmail(
          user.email,
          user.name || user.email.split('@')[0],
          {
            title: tip.title,
            content: tip.content,
            category: tip.category,
          },
        );

        if (success) {
          sentCount++;
          console.log(`✅ Email sent to ${user.email}`);
        } else {
          errorCount++;
          console.error(`❌ Failed to send email to ${user.email}`);
        }
      } catch (error: any) {
        console.error(`Error processing user ${user.id} (${user.email}):`, error?.message || error);
        errorCount++;
      }
    }

    return NextResponse.json({
      success: true,
      sent: sentCount,
      errors: errorCount,
      total: users.length,
    });
  } catch (error: any) {
    console.error('Unexpected error in cron job:', error);
    return NextResponse.json(
      { 
        error: 'Unexpected error',
        message: error?.message || 'Unknown error',
        details: process.env.NODE_ENV === 'development' ? error?.stack : undefined
      },
      { status: 500 }
    );
  }
}

