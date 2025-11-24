import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

// This cron runs daily to downgrade users whose trials have expired
// Only downgrades users who are on trial (have trial_ends_at set) and haven't subscribed

export async function GET(request: NextRequest) {
  // Verify this is a cron request (from Vercel Cron)
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const adminSupabase = getSupabaseAdmin();
    const now = new Date();

    // Find users with expired trials who haven't subscribed (no stripe_subscription_id)
    const { data: expiredTrials, error: fetchError } = await adminSupabase
      .from('users')
      .select('id, email, name, trial_ends_at, stripe_subscription_id')
      .eq('subscription_tier', 'premium')
      .not('trial_ends_at', 'is', null)
      .lte('trial_ends_at', now.toISOString())
      .is('stripe_subscription_id', null); // Only downgrade if they haven't subscribed

    if (fetchError) {
      console.error('Error fetching expired trials:', fetchError);
      return NextResponse.json(
        { error: 'Failed to fetch expired trials' },
        { status: 500 }
      );
    }

    if (!expiredTrials || expiredTrials.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No expired trials to downgrade',
        count: 0,
      });
    }

    // Downgrade all expired trials
    const userIds = expiredTrials.map((user) => user.id);
    const { error: updateError } = await adminSupabase
      .from('users')
      .update({
        subscription_tier: 'free',
        trial_ends_at: null, // Clear trial end date
        trial_notification_sent: false, // Reset for potential future trials
      })
      .in('id', userIds);

    if (updateError) {
      console.error('Error downgrading expired trials:', updateError);
      return NextResponse.json(
        { error: 'Failed to downgrade expired trials' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      downgraded: expiredTrials.length,
      user_ids: userIds,
    });
  } catch (error: any) {
    console.error('Error downgrading expired trials:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to downgrade expired trials' },
      { status: 500 }
    );
  }
}

