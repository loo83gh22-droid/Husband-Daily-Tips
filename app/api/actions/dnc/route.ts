import { NextResponse } from 'next/server';
import { getSession } from '@auth0/nextjs-auth0';
import { getSupabaseAdmin } from '@/lib/supabase';

/**
 * Mark an action as DNC (Did Not Complete)
 * This hides it from outstanding actions without marking it as completed
 */
export async function POST(request: Request) {
  try {
    const session = await getSession();

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const auth0Id = session.user.sub;
    const body = await request.json();
    const { userDailyActionId } = body;

    if (!userDailyActionId) {
      return NextResponse.json({ error: 'Missing userDailyActionId' }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();

    // Get user
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('auth0_id', auth0Id)
      .single();

    if (userError || !user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Verify this action belongs to the user
    const { data: dailyAction, error: actionError } = await supabase
      .from('user_daily_actions')
      .select('user_id')
      .eq('id', userDailyActionId)
      .eq('user_id', user.id)
      .single();

    if (actionError || !dailyAction) {
      return NextResponse.json({ error: 'Action not found' }, { status: 404 });
    }

    // Mark as DNC
    const { error: updateError } = await supabase
      .from('user_daily_actions')
      .update({ dnc: true })
      .eq('id', userDailyActionId);

    if (updateError) {
      console.error('Error marking action as DNC:', updateError);
      return NextResponse.json({ error: 'Failed to mark action as DNC' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Unexpected error marking action as DNC:', error);
    return NextResponse.json({ error: 'Unexpected error' }, { status: 500 });
  }
}

