import { NextResponse } from 'next/server';
import { getSession } from '@auth0/nextjs-auth0';
import { supabase } from '@/lib/supabase';

/**
 * Toggle favorite status for a tip
 */
export async function POST(request: Request) {
  try {
    const session = await getSession();

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const auth0Id = session.user.sub;
    const { tipId } = await request.json();

    if (!tipId) {
      return NextResponse.json({ error: 'Missing tipId' }, { status: 400 });
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

    // Check if user_tips entry exists (any date)
    const { data: existingUserTips } = await supabase
      .from('user_tips')
      .select('id, favorited, date')
      .eq('user_id', user.id)
      .eq('tip_id', tipId)
      .order('date', { ascending: false })
      .limit(1);

    const existingUserTip = existingUserTips && existingUserTips.length > 0 ? existingUserTips[0] : null;

    if (existingUserTip) {
      // Toggle favorite status
      const { error: updateError } = await supabase
        .from('user_tips')
        .update({ favorited: !existingUserTip.favorited })
        .eq('id', existingUserTip.id);

      if (updateError) {
        console.error('Error updating favorite:', updateError);
        return NextResponse.json({ error: 'Failed to update favorite' }, { status: 500 });
      }

      return NextResponse.json({
        success: true,
        favorited: !existingUserTip.favorited,
      });
    } else {
      // Create new user_tips entry with favorited = true
      // Use today's date if no existing entry
      const today = new Date().toISOString().split('T')[0];
      const { error: insertError } = await supabase.from('user_tips').insert({
        user_id: user.id,
        tip_id: tipId,
        date: today,
        favorited: true,
        completed: false,
      });

      if (insertError) {
        console.error('Error creating favorite:', insertError);
        return NextResponse.json({ error: 'Failed to create favorite' }, { status: 500 });
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

