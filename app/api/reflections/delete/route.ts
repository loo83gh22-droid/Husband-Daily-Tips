import { NextResponse } from 'next/server';
import { getSession } from '@auth0/nextjs-auth0';
import { getSupabaseAdmin } from '@/lib/supabase';
import { recalculateUserBadges } from '@/lib/recalculate-badges';

/**
 * Delete a reflection (journal entry)
 */
export async function POST(request: Request) {
  try {
    const session = await getSession();

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const auth0Id = session.user.sub;
    const { reflectionId } = await request.json();

    if (!reflectionId) {
      return NextResponse.json({ error: 'Missing reflectionId' }, { status: 400 });
    }

    // Use admin client to bypass RLS (Auth0 context isn't set)
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

    // Get the reflection to check ownership and if it's shared
    const { data: reflection, error: reflectionError } = await supabaseAdmin
      .from('reflections')
      .select('id, user_id, shared_to_forum')
      .eq('id', reflectionId)
      .single();

    if (reflectionError || !reflection) {
      return NextResponse.json({ error: 'Reflection not found' }, { status: 404 });
    }

    // Verify ownership
    if (reflection.user_id !== user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // If shared to Team Wins, delete from deep_thoughts first (cascade should handle this, but being explicit)
    if (reflection.shared_to_forum) {
      await supabaseAdmin
        .from('deep_thoughts')
        .delete()
        .eq('reflection_id', reflectionId);
    }

    // Delete any linked action completions (they reference this reflection via journal_entry_id)
    // We'll delete the action completions that reference this reflection
    await supabaseAdmin
      .from('user_action_completions')
      .delete()
      .eq('journal_entry_id', reflectionId);

    // Delete the reflection itself
    const { error: deleteError } = await supabaseAdmin
      .from('reflections')
      .delete()
      .eq('id', reflectionId)
      .eq('user_id', user.id); // Double-check ownership
      
    if (deleteError) {
      console.error('Error deleting reflection:', deleteError);
      return NextResponse.json({ error: 'Failed to delete reflection' }, { status: 500 });
    }

    // After removing the journal entry and linked action completion(s),
    // recalculate this user's badges so counts stay consistent.
    try {
      await recalculateUserBadges(supabaseAdmin as any, user.id);
    } catch (badgeError) {
      console.error('Error recalculating badges after reflection delete:', badgeError);
      // Don't fail the delete request; badge recalculation is best-effort.
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Unexpected error deleting reflection:', error);
    return NextResponse.json({ error: 'Unexpected error' }, { status: 500 });
  }
}

