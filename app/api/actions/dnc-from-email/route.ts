import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';

/**
 * Mark an action as DNC (Did Not Complete) from email link
 * This endpoint works with actionId + userId + date (for email links)
 * It finds the user_daily_actions record and marks it as DNC
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { actionId, userId, date } = body;

    if (!actionId || !userId) {
      return NextResponse.json({ error: 'Missing actionId or userId' }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();

    // Find the user_daily_actions record
    // If date is provided, use it; otherwise find the most recent incomplete one
    let query = supabase
      .from('user_daily_actions')
      .select('id, user_id, action_id, date, completed, dnc')
      .eq('user_id', userId)
      .eq('action_id', actionId)
      .eq('completed', false);

    if (date) {
      query = query.eq('date', date);
    } else {
      // Get the most recent incomplete action for this action_id
      query = query.order('date', { ascending: false }).limit(1);
    }

    const { data: dailyActions, error: findError } = await query;

    if (findError || !dailyActions || dailyActions.length === 0) {
      return NextResponse.json(
        { error: 'Action not found or already completed' },
        { status: 404 }
      );
    }

    const dailyAction = dailyActions[0];

    // Mark as DNC
    const { error: updateError } = await supabase
      .from('user_daily_actions')
      .update({ dnc: true })
      .eq('id', dailyAction.id);

    if (updateError) {
      console.error('Error marking action as DNC:', updateError);
      return NextResponse.json({ error: 'Failed to mark action as DNC' }, { status: 500 });
    }

    // Return success with redirect URL
    return NextResponse.json({
      success: true,
      message: 'Action marked as Did Not Complete',
      redirectUrl: '/dashboard',
    });
  } catch (error) {
    console.error('Unexpected error marking action as DNC:', error);
    return NextResponse.json({ error: 'Unexpected error' }, { status: 500 });
  }
}

