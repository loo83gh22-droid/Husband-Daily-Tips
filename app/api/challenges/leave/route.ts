import { NextResponse } from 'next/server';
import { getSession } from '@auth0/nextjs-auth0';
import { getSupabaseAdmin } from '@/lib/supabase';
import { logger } from '@/lib/logger';

/**
 * Leave/cancel a 7-day event
 */
export async function POST(request: Request) {
  try {
    const session = await getSession();

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const auth0Id = session.user.sub;
    const { challengeId } = await request.json();

    if (!challengeId) {
      return NextResponse.json({ error: 'Missing challengeId' }, { status: 400 });
    }

    // Use admin client to bypass RLS (Auth0 context isn't set)
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

    // Check if user is enrolled in this challenge
    const { data: userChallenge, error: checkError } = await supabase
      .from('user_challenges')
      .select('*, challenges(name)')
      .eq('user_id', user.id)
      .eq('challenge_id', challengeId)
      .eq('completed', false)
      .single();

    if (checkError || !userChallenge) {
      return NextResponse.json({ 
        error: 'You are not enrolled in this 7-day event or it is already completed' 
      }, { status: 404 });
    }

    // Mark the challenge as completed (this effectively cancels/leaves it)
    // Setting completed = true will make the dashboard stop showing event actions
    const { error: updateError } = await supabase
      .from('user_challenges')
      .update({ 
        completed: true,
        // Keep completed_days as is, so we have a record of progress
      })
      .eq('id', userChallenge.id);

    if (updateError) {
      logger.error('Error leaving challenge:', updateError);
      return NextResponse.json({ error: 'Failed to leave 7-day event' }, { status: 500 });
    }

    const challengeName = (userChallenge.challenges as any)?.name || '7-day event';

    logger.log(`User ${user.id} left 7-day event: ${challengeName}`);

    return NextResponse.json({ 
      success: true, 
      message: `You have left the ${challengeName}. You will now receive regular daily actions.` 
    });
  } catch (error) {
    logger.error('Unexpected error leaving challenge:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

