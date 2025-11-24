import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@auth0/nextjs-auth0';
import { getSupabaseAdmin } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

// Track referral signup (called when a new user signs up with a referral code)
export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { referralCode } = await request.json();

    if (!referralCode || typeof referralCode !== 'string') {
      return NextResponse.json(
        { error: 'Invalid referral code' },
        { status: 400 }
      );
    }

    const auth0Id = session.user.sub;
    const adminSupabase = getSupabaseAdmin();

    // Get current user (referee)
    const { data: referee, error: refereeError } = await adminSupabase
      .from('users')
      .select('id, referred_by_user_id')
      .eq('auth0_id', auth0Id)
      .single();

    if (refereeError || !referee) {
      console.error('Error fetching referee:', refereeError);
      return NextResponse.json(
        { error: 'Failed to fetch user' },
        { status: 500 }
      );
    }

    // Check if user was already referred
    if (referee.referred_by_user_id) {
      return NextResponse.json(
        { error: 'User already has a referral' },
        { status: 400 }
      );
    }

    // Find referrer by referral code
    const { data: referrer, error: referrerError } = await adminSupabase
      .from('users')
      .select('id')
      .eq('referral_code', referralCode.toUpperCase())
      .single();

    if (referrerError || !referrer) {
      return NextResponse.json(
        { error: 'Invalid referral code' },
        { status: 404 }
      );
    }

    // Prevent self-referral
    if (referrer.id === referee.id) {
      return NextResponse.json(
        { error: 'Cannot refer yourself' },
        { status: 400 }
      );
    }

    // Create referral record
    const { error: referralError } = await adminSupabase
      .from('referrals')
      .insert({
        referrer_id: referrer.id,
        referee_id: referee.id,
        referral_code: referralCode.toUpperCase(),
        status: 'pending',
      });

    if (referralError) {
      console.error('Error creating referral:', referralError);
      // Check if it's a duplicate (user already referred)
      if (referralError.code === '23505') {
        return NextResponse.json(
          { error: 'Referral already exists' },
          { status: 400 }
        );
      }
      return NextResponse.json(
        { error: 'Failed to track referral' },
        { status: 500 }
      );
    }

    // Update referee to link to referrer
    await adminSupabase
      .from('users')
      .update({ referred_by_user_id: referrer.id })
      .eq('id', referee.id);

    return NextResponse.json({
      success: true,
      message: 'Referral tracked successfully',
    });
  } catch (error: any) {
    console.error('Error in track referral endpoint:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

