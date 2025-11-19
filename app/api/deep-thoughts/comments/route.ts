import { NextResponse } from 'next/server';
import { getSession } from '@auth0/nextjs-auth0';
import { getSupabaseAdmin } from '@/lib/supabase';

/**
 * Create a new comment on a Deep Thoughts post
 */
export async function POST(request: Request) {
  try {
    const session = await getSession();

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const auth0Id = session.user.sub;
    const { postId, content } = await request.json();

    if (!postId || !content || !content.trim()) {
      return NextResponse.json(
        { error: 'Missing postId or content' },
        { status: 400 },
      );
    }

    const supabase = getSupabaseAdmin();

    // Get user
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('auth0_id', auth0Id)
      .single();

    if (userError || !user) {
      console.error('Error fetching user for comment:', userError);
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Verify post exists
    const { data: post, error: postError } = await supabase
      .from('deep_thoughts')
      .select('id')
      .eq('id', postId)
      .single();

    if (postError || !post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    // Create comment
    const { data: comment, error: commentError } = await supabase
      .from('deep_thoughts_comments')
      .insert({
        deep_thought_id: postId,
        user_id: user.id,
        content: content.trim(),
      })
      .select()
      .single();

    if (commentError) {
      console.error('Error creating comment:', commentError);
      return NextResponse.json(
        { error: 'Failed to create comment' },
        { status: 500 },
      );
    }

    return NextResponse.json({ success: true, comment });
  } catch (error) {
    console.error('Unexpected error creating comment:', error);
    return NextResponse.json({ error: 'Unexpected error' }, { status: 500 });
  }
}

