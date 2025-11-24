import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@auth0/nextjs-auth0';
import { getSupabaseAdmin } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

// Get or generate referral code for the current user
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

    // Get user's referral code
    const { data: user, error } = await adminSupabase
      .from('users')
      .select('referral_code')
      .eq('auth0_id', auth0Id)
      .single();

    if (error) {
      console.error('Error fetching referral code:', error);
      return NextResponse.json(
        { error: 'Failed to fetch referral code' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      referralCode: user?.referral_code || null,
    });
  } catch (error: any) {
    console.error('Error in referral code endpoint:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

