import { NextResponse } from 'next/server';
import { getSession } from '@auth0/nextjs-auth0';
import { getSupabaseAdmin } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const session = await getSession();

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const auth0Id = session.user.sub;
    const { postId } = await request.json();

    if (!postId) {
      return NextResponse.json({ error: 'Post ID is required' }, { status: 400 });
    }

    const adminSupabase = getSupabaseAdmin();

    // Get current user
    const { data: currentUser } = await adminSupabase
      .from('users')
      .select('id')
      .eq('auth0_id', auth0Id)
      .single();

    if (!currentUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get the post
    const { data: post, error: postError } = await adminSupabase
      .from('deep_thoughts')
      .select('user_id, is_removed')
      .eq('id', postId)
      .single();

    if (postError || !post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    if (post.is_removed) {
      return NextResponse.json({ error: 'Post is already removed' }, { status: 400 });
    }

    // Check if user is the author (users can remove their own posts)
    const isAuthor = post.user_id === currentUser.id;

    if (!isAuthor) {
      return NextResponse.json(
        { error: 'You can only remove your own posts' },
        { status: 403 }
      );
    }

    // Remove the post
    const { error: removeError } = await adminSupabase
      .from('deep_thoughts')
      .update({
        is_removed: true,
        removed_at: new Date().toISOString(),
        removed_by: currentUser.id,
      })
      .eq('id', postId);

    if (removeError) {
      console.error('Error removing post:', removeError);
      return NextResponse.json(
        { error: 'Failed to remove post' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Post removed successfully',
    });
  } catch (error) {
    console.error('Unexpected error removing post:', error);
    return NextResponse.json(
      { error: 'Unexpected error' },
      { status: 500 }
    );
  }
}

