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
    const { tipId, content, shareToForum } = await request.json();

    if (!tipId || !content?.trim()) {
      return NextResponse.json({ error: 'Missing tipId or content' }, { status: 400 });
    }

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
    if (shareToForum && user.subscription_tier === 'free') {
      return NextResponse.json(
        { error: 'Upgrade to Paid to share your wins to Team Wins' },
        { status: 403 }
      );
    }

    // Get today's user_tip record
    const today = new Date().toISOString().split('T')[0];
    const { data: userTip, error: userTipError } = await supabase
      .from('user_tips')
      .select('id')
      .eq('user_id', user.id)
      .eq('tip_id', tipId)
      .eq('date', today)
      .single();

    // Create reflection
    const { data: reflection, error: reflectionError } = await supabase
      .from('reflections')
      .insert({
        user_id: user.id,
        user_tip_id: userTip?.id || null,
        content: content.trim(),
        shared_to_forum: shareToForum || false,
      })
      .select()
      .single();

    if (reflectionError) {
      console.error('Error creating reflection:', reflectionError);
      return NextResponse.json({ error: 'Failed to save reflection' }, { status: 500 });
    }

    // If shared to forum, create a Deep Thought post
    if (shareToForum && reflection) {
      // Get tip category for context
      const { data: tipData } = await supabase
        .from('tips')
        .select('category')
        .eq('id', tipId)
        .single();

      await supabase.from('deep_thoughts').insert({
        reflection_id: reflection.id,
        user_id: user.id,
        content: content.trim(),
        tip_category: tipData?.category || null,
      });
    }

    return NextResponse.json({ success: true, reflectionId: reflection.id });
  } catch (error) {
    console.error('Unexpected error creating reflection:', error);
    return NextResponse.json({ error: 'Unexpected error' }, { status: 500 });
  }
}

