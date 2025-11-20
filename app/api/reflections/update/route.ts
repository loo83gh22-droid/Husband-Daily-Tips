import { NextResponse } from 'next/server';
import { getSession } from '@auth0/nextjs-auth0';
import { supabase } from '@/lib/supabase';

/**
 * Update reflection content
 */
export async function POST(request: Request) {
  try {
    const session = await getSession();

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const auth0Id = session.user.sub;
    const { reflectionId, content } = await request.json();

    if (!reflectionId || !content?.trim()) {
      return NextResponse.json({ error: 'Missing reflectionId or content' }, { status: 400 });
    }

    // Get user
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('auth0_id', auth0Id)
      .single();

    if (userError || !user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get the reflection to check ownership
    const { data: reflection, error: reflectionError } = await supabase
      .from('reflections')
      .select('id, user_id')
      .eq('id', reflectionId)
      .single();

    if (reflectionError || !reflection) {
      return NextResponse.json({ error: 'Reflection not found' }, { status: 404 });
    }

    // Verify ownership
    if (reflection.user_id !== user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Update reflection content
    const { data: updatedReflection, error: updateError } = await supabase
      .from('reflections')
      .update({ 
        content: content.trim(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', reflectionId)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating reflection:', updateError);
      return NextResponse.json({ error: 'Failed to update reflection' }, { status: 500 });
    }

    // If this reflection is shared to forum, update the deep_thoughts entry too
    if (updatedReflection.shared_to_forum) {
      await supabase
        .from('deep_thoughts')
        .update({ content: content.trim() })
        .eq('reflection_id', reflectionId);
    }

    return NextResponse.json({
      success: true,
      reflection: updatedReflection,
    });
  } catch (error) {
    console.error('Unexpected error updating reflection:', error);
    return NextResponse.json({ error: 'Unexpected error' }, { status: 500 });
  }
}

