import { NextResponse } from 'next/server';
import { getSession } from '@auth0/nextjs-auth0';
import { getSupabaseAdmin } from '@/lib/supabase';

/**
 * Toggle shared_to_forum status for a reflection
 */
export async function POST(request: Request) {
  try {
    const session = await getSession();

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const auth0Id = session.user.sub;
    const { reflectionId, shared } = await request.json();

    if (!reflectionId || typeof shared !== 'boolean') {
      return NextResponse.json({ error: 'Missing reflectionId or shared status' }, { status: 400 });
    }

    // Use admin client to bypass RLS (Auth0 context isn't set)
    const supabase = getSupabaseAdmin();

    // Get user and subscription tier
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, subscription_tier')
      .eq('auth0_id', auth0Id)
      .single();

    if (userError || !user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if free user is trying to share to forum
    if (shared && user.subscription_tier === 'free') {
      return NextResponse.json(
        { error: 'Upgrade to Paid to share your wins to Team Wins' },
        { status: 403 }
      );
    }

    // Get the reflection to check ownership and current shared status
    const { data: reflection, error: reflectionError } = await supabase
      .from('reflections')
      .select('id, shared_to_forum, user_id, content, user_tip_id')
      .eq('id', reflectionId)
      .single();

    if (reflectionError || !reflection) {
      return NextResponse.json({ error: 'Reflection not found' }, { status: 404 });
    }

    // Verify ownership
    if (reflection.user_id !== user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Update shared_to_forum status
    const { error: updateError } = await supabase
      .from('reflections')
      .update({ shared_to_forum: shared })
      .eq('id', reflectionId);

    if (updateError) {
      console.error('Error updating shared status:', updateError);
      return NextResponse.json({ error: 'Failed to update shared status' }, { status: 500 });
    }

    // If sharing to forum, create/update deep_thoughts entry
    if (shared) {
      // Check if deep_thought already exists
      const { data: existingDeepThought } = await supabase
        .from('deep_thoughts')
        .select('id')
        .eq('reflection_id', reflectionId)
        .single();

      if (existingDeepThought) {
        // Update existing entry
        await supabase
          .from('deep_thoughts')
          .update({ content: reflection.content })
          .eq('id', existingDeepThought.id);
      } else {
        // Get tip category for context if available
        let tipCategory = null;
        if (reflection.user_tip_id) {
          const { data: tipData } = await supabase
            .from('user_tips')
            .select('tips(category)')
            .eq('id', reflection.user_tip_id)
            .single();
          // Handle nested structure from Supabase
          const tipsData = tipData?.tips as any;
          tipCategory = tipsData?.category || null;
        }

        // Create new deep_thought entry
        await supabase.from('deep_thoughts').insert({
          reflection_id: reflectionId,
          user_id: user.id,
          content: reflection.content,
          tip_category: tipCategory,
        });
      }
    } else {
      // If unsharing, remove from deep_thoughts
      await supabase
        .from('deep_thoughts')
        .delete()
        .eq('reflection_id', reflectionId);
    }

    return NextResponse.json({
      success: true,
      shared_to_forum: shared,
    });
  } catch (error) {
    console.error('Unexpected error toggling share:', error);
    return NextResponse.json({ error: 'Unexpected error' }, { status: 500 });
  }
}

