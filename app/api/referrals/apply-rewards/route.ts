import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

// Apply referral rewards when a referee subscribes to Premium
// This is called by the Stripe webhook when a subscription is created
export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    const adminSupabase = getSupabaseAdmin();

    // Find the referral for this user (referee)
    const { data: referral, error: referralError } = await adminSupabase
      .from('referrals')
      .select('id, referrer_id, status')
      .eq('referee_id', userId)
      .eq('status', 'pending')
      .single();

    if (referralError || !referral) {
      // No referral found or already processed - that's okay
      return NextResponse.json({
        success: true,
        message: 'No referral to process',
      });
    }

    // Check if referral was already converted
    if (referral.status !== 'pending') {
      return NextResponse.json({
        success: true,
        message: 'Referral already processed',
      });
    }

    // Update referral status to converted
    await adminSupabase
      .from('referrals')
      .update({
        status: 'converted',
        converted_at: new Date().toISOString(),
      })
      .eq('id', referral.id);

    // Apply rewards to both referrer and referee
    // 1. Give referrer 1 free month credit
    await adminSupabase.rpc('increment', {
      table_name: 'users',
      column_name: 'referral_credits',
      row_id: referral.referrer_id,
      increment_value: 1,
    });

    // If increment function doesn't exist, use update
    const { data: referrer } = await adminSupabase
      .from('users')
      .select('referral_credits')
      .eq('id', referral.referrer_id)
      .single();

    if (referrer) {
      await adminSupabase
        .from('users')
        .update({
          referral_credits: (referrer.referral_credits || 0) + 1,
        })
        .eq('id', referral.referrer_id);
    }

    // 2. Give referee 1 free month (extend subscription or apply credit)
    // For now, we'll extend their subscription by 1 month
    // This will be handled by applying a credit that extends their subscription period
    const { data: referee } = await adminSupabase
      .from('users')
      .select('subscription_ends_at, stripe_subscription_id')
      .eq('id', userId)
      .single();

    if (referee && referee.subscription_ends_at) {
      // Extend subscription by 1 month (30 days)
      const currentEnd = new Date(referee.subscription_ends_at);
      const newEnd = new Date(currentEnd);
      newEnd.setMonth(newEnd.getMonth() + 1);

      await adminSupabase
        .from('users')
        .update({
          subscription_ends_at: newEnd.toISOString(),
        })
        .eq('id', userId);
    }

    // Update referral status to rewarded
    await adminSupabase
      .from('referrals')
      .update({
        status: 'rewarded',
        rewarded_at: new Date().toISOString(),
      })
      .eq('id', referral.id);

    return NextResponse.json({
      success: true,
      message: 'Referral rewards applied successfully',
    });
  } catch (error: any) {
    console.error('Error applying referral rewards:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

