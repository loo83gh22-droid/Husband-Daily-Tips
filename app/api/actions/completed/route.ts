import { NextResponse } from 'next/server';
import { getSession } from '@auth0/nextjs-auth0';
import { getSupabaseAdmin } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

/**
 * Get user's completed action IDs
 * GET /api/actions/completed
 */
export async function GET(request: Request) {
  try {
    const session = await getSession();

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const auth0Id = session.user.sub;
    const adminSupabase = getSupabaseAdmin();

    const { data: user } = await adminSupabase
      .from('users')
      .select('id')
      .eq('auth0_id', auth0Id)
      .single();

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get completed actions from user_action_completions
    const { data: completions } = await adminSupabase
      .from('user_action_completions')
      .select('action_id')
      .eq('user_id', user.id);

    const completedIds = new Set(completions?.map((c) => c.action_id) || []);

    return NextResponse.json({ completedIds: Array.from(completedIds) });
  } catch (error: any) {
    console.error('Error fetching completed actions:', error);
    return NextResponse.json({ error: 'Failed to fetch completed actions' }, { status: 500 });
  }
}

