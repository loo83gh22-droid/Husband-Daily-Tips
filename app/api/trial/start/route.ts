import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@auth0/nextjs-auth0';
import { getSupabaseAdmin } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const auth0Id = session.user.sub;
    const adminSupabase = getSupabaseAdmin();

    // Get user from database
    const { data: user, error: userError } = await adminSupabase
      .from('users')
      .select('id, subscription_tier, trial_started_at, trial_ends_at')
      .eq('auth0_id', auth0Id)
      .single();

    if (userError || !user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Check if user already has an active trial or is already premium
    if (user.subscription_tier === 'premium' && !user.trial_ends_at) {
      return NextResponse.json(
        { error: 'User already has premium subscription' },
        { status: 400 }
      );
    }

    // Check if user already has an active trial
    if (user.trial_ends_at) {
      const trialEndDate = new Date(user.trial_ends_at);
      const now = new Date();
      if (trialEndDate > now) {
        return NextResponse.json(
          { 
            error: 'Trial already active',
            trial_ends_at: user.trial_ends_at,
            days_remaining: Math.ceil((trialEndDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
          },
          { status: 400 }
        );
      }
    }

    // Start the trial: 7 days from now
    const trialStart = new Date();
    const trialEnd = new Date();
    trialEnd.setDate(trialEnd.getDate() + 7);

    // Update user to premium tier with trial dates
    const { error: updateError } = await adminSupabase
      .from('users')
      .update({
        subscription_tier: 'premium',
        trial_started_at: trialStart.toISOString(),
        trial_ends_at: trialEnd.toISOString(),
        trial_notification_sent: false,
      })
      .eq('id', user.id);

    if (updateError) {
      console.error('Error starting trial:', updateError);
      return NextResponse.json(
        { error: 'Failed to start trial' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      trial_started_at: trialStart.toISOString(),
      trial_ends_at: trialEnd.toISOString(),
      message: '7-day free trial started! Enjoy all premium features.',
    });
  } catch (error: any) {
    console.error('Error starting trial:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to start trial' },
      { status: 500 }
    );
  }
}

