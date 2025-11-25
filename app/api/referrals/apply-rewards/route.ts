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

    // Apply reward to referrer only
    // Give referrer 1 free month credit (capped at 12 months)
    const { data: referrer } = await adminSupabase
      .from('users')
      .select('referral_credits')
      .eq('id', referral.referrer_id)
      .single();

    if (referrer) {
      const currentCredits = referrer.referral_credits || 0;
      // Cap at 12 months total
      const newCredits = Math.min(currentCredits + 1, 12);
      
      await adminSupabase
        .from('users')
        .update({
          referral_credits: newCredits,
        })
        .eq('id', referral.referrer_id);
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

