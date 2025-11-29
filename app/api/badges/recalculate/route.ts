import { NextResponse } from 'next/server';
import { getSession } from '@auth0/nextjs-auth0';
import { getSupabaseAdmin } from '@/lib/supabase';
import { recalculateUserBadges } from '@/lib/recalculate-badges';

/**
 * Manually recalculate all badges for the current user
 * This clears existing badges and re-awards them based on current completions
 */
export async function POST(request: Request) {
  try {
    const session = await getSession();

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const auth0Id = session.user.sub;
    const supabaseAdmin = getSupabaseAdmin();

    // Get user
    const { data: user, error: userError } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('auth0_id', auth0Id)
      .single();

    if (userError || !user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Recalculate badges
    const result = await recalculateUserBadges(supabaseAdmin as any, user.id);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to recalculate badges' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      badgesAwarded: result.badgesAwarded,
    });
  } catch (error) {
    console.error('Unexpected error recalculating badges:', error);
    return NextResponse.json({ error: 'Unexpected error' }, { status: 500 });
  }
}

