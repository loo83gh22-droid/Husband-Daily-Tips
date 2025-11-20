import { NextResponse } from 'next/server';
import { getSession } from '@auth0/nextjs-auth0';
import { supabase } from '@/lib/supabase';
import { getSupabaseAdmin } from '@/lib/supabase';

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

    const supabaseAdmin = getSupabaseAdmin();

    // Get user
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('auth0_id', auth0Id)
      .single();

    if (userError || !user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get the reflection to check ownership and if it's shared
    const { data: reflection, error: reflectionError } = await supabase
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

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Unexpected error deleting reflection:', error);
    return NextResponse.json({ error: 'Unexpected error' }, { status: 500 });
  }
}

