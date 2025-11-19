import { NextResponse } from 'next/server';
import { getSession } from '@auth0/nextjs-auth0';
import { supabase } from '@/lib/supabase';

/**
 * Toggle favorite status for a reflection
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

    // Get user
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('auth0_id', auth0Id)
      .single();

    if (userError || !user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get the reflection to check ownership and current favorite status
    const { data: reflection, error: reflectionError } = await supabase
      .from('reflections')
      .select('id, favorited, user_id')
      .eq('id', reflectionId)
      .single();

    if (reflectionError || !reflection) {
      return NextResponse.json({ error: 'Reflection not found' }, { status: 404 });
    }

    // Verify ownership
    if (reflection.user_id !== user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Toggle favorite status
    const { error: updateError } = await supabase
      .from('reflections')
      .update({ favorited: !reflection.favorited })
      .eq('id', reflectionId);

    if (updateError) {
      console.error('Error updating favorite:', updateError);
      return NextResponse.json({ error: 'Failed to update favorite' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      favorited: !reflection.favorited,
    });
  } catch (error) {
    console.error('Unexpected error toggling favorite:', error);
    return NextResponse.json({ error: 'Unexpected error' }, { status: 500 });
  }
}

