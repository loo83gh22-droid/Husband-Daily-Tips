import { NextResponse } from 'next/server';
import { getSession } from '@auth0/nextjs-auth0';
import { getSupabaseAdmin } from '@/lib/supabase';

/**
 * Toggle favorite status for an action
 */
export async function POST(request: Request) {
  try {
    const session = await getSession();

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const auth0Id = session.user.sub;
    const { actionId } = await request.json();

    if (!actionId) {
      return NextResponse.json({ error: 'Missing actionId' }, { status: 400 });
    }

    // Use admin client to bypass RLS (Auth0 context isn't set)
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

    // Check if user_daily_actions entry exists (any date)
    const { data: existingUserActions } = await supabase
      .from('user_daily_actions')
      .select('id, favorited, date')
      .eq('user_id', user.id)
      .eq('action_id', actionId)
      .order('date', { ascending: false })
      .limit(1);

    const existingUserAction = existingUserActions && existingUserActions.length > 0 ? existingUserActions[0] : null;

    if (existingUserAction) {
      // Toggle favorite status
      const { error: updateError } = await supabase
        .from('user_daily_actions')
        .update({ favorited: !existingUserAction.favorited })
        .eq('id', existingUserAction.id);

      if (updateError) {
        console.error('Error updating favorite:', updateError);
        return NextResponse.json({ error: 'Failed to update favorite. Please try again.' }, { status: 500 });
      }

      return NextResponse.json({
        success: true,
        favorited: !existingUserAction.favorited,
      });
    } else {
      // Create new user_daily_actions entry with favorited = true
      // Use today's date if no existing entry
      const today = new Date().toISOString().split('T')[0];
      const { error: insertError } = await supabase.from('user_daily_actions').insert({
        user_id: user.id,
        action_id: actionId,
        date: today,
        favorited: true,
        completed: false,
      });

      if (insertError) {
        console.error('Error creating favorite:', insertError);
        return NextResponse.json({ error: 'Failed to create favorite. Please try again.' }, { status: 500 });
      }

      return NextResponse.json({
        success: true,
        favorited: true,
      });
    }
  } catch (error) {
    console.error('Unexpected error toggling favorite:', error);
    return NextResponse.json({ error: 'Unexpected error' }, { status: 500 });
  }
}
