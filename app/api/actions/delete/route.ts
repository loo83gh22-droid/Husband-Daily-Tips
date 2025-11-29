import { NextResponse } from 'next/server';
import { getSession } from '@auth0/nextjs-auth0';
import { getSupabaseAdmin } from '@/lib/supabase';
import { recalculateUserBadges } from '@/lib/recalculate-badges';

/**
 * Delete a specific action completion by completion ID
 */
export async function POST(request: Request) {
  try {
    const session = await getSession();

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const auth0Id = session.user.sub;
    const { completionId } = await request.json();

    if (!completionId) {
      return NextResponse.json({ error: 'Missing completionId' }, { status: 400 });
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

    // Get the completion to check ownership and if it has a linked journal entry
    const { data: completion, error: completionError } = await supabase
      .from('user_action_completions')
      .select('id, user_id, journal_entry_id')
      .eq('id', completionId)
      .single();

    if (completionError || !completion) {
      return NextResponse.json({ error: 'Action completion not found' }, { status: 404 });
    }

    // Verify ownership
    if (completion.user_id !== user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // If there's a linked journal entry, delete it too (and any Team Wins share)
    if (completion.journal_entry_id) {
      // Check if the reflection is shared to Team Wins
      const { data: reflection } = await supabase
        .from('reflections')
        .select('shared_to_forum')
        .eq('id', completion.journal_entry_id)
        .single();

      if (reflection?.shared_to_forum) {
        // Delete from deep_thoughts
        await supabase
          .from('deep_thoughts')
          .delete()
          .eq('reflection_id', completion.journal_entry_id);
      }

      // Delete the linked reflection
      await supabase
        .from('reflections')
        .delete()
        .eq('id', completion.journal_entry_id);
    }

    // Delete the action completion
    const { error: deleteError } = await supabase
      .from('user_action_completions')
      .delete()
      .eq('id', completionId)
      .eq('user_id', user.id); // Double-check ownership

    if (deleteError) {
      console.error('Error deleting action completion:', deleteError);
      return NextResponse.json({ error: 'Failed to delete action completion' }, { status: 500 });
    }

    // Recalculate badges after deleting the completion
    try {
      await recalculateUserBadges(supabase, user.id);
    } catch (badgeError) {
      console.error('Error recalculating badges after action delete:', badgeError);
      // Don't fail the delete request; badge recalculation is best-effort.
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Unexpected error deleting action completion:', error);
    return NextResponse.json({ error: 'Unexpected error' }, { status: 500 });
  }
}

