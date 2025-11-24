import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@auth0/nextjs-auth0';
import { getSupabaseAdmin } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

// Get referral statistics for the current user
export async function GET(request: NextRequest) {
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

    // Get user ID
    const { data: user, error: userError } = await adminSupabase
      .from('users')
      .select('id, referral_code, referral_credits')
      .eq('auth0_id', auth0Id)
      .single();

    if (userError || !user) {
      console.error('Error fetching user:', userError);
      return NextResponse.json(
        { error: 'Failed to fetch user' },
        { status: 500 }
      );
    }

    // Get referral statistics
    const { data: referrals, error: referralsError } = await adminSupabase
      .from('referrals')
      .select('id, status, created_at, converted_at')
      .eq('referrer_id', user.id);

    if (referralsError) {
      console.error('Error fetching referrals:', referralsError);
      return NextResponse.json(
        { error: 'Failed to fetch referrals' },
        { status: 500 }
      );
    }

    const stats = {
      totalReferrals: referrals?.length || 0,
      pendingReferrals: referrals?.filter(r => r.status === 'pending').length || 0,
      convertedReferrals: referrals?.filter(r => r.status === 'converted').length || 0,
      rewardedReferrals: referrals?.filter(r => r.status === 'rewarded').length || 0,
      referralCredits: user.referral_credits || 0,
      referralCode: user.referral_code || null,
    };

    return NextResponse.json(stats);
  } catch (error: any) {
    console.error('Error in referral stats endpoint:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

