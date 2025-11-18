import { NextResponse } from 'next/server';
import { getSession } from '@auth0/nextjs-auth0';
import { supabase } from '@/lib/supabase';

export async function GET(request: Request) {
  try {
    const session = await getSession();

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const auth0Id = session.user.sub;
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    // Get user
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('auth0_id', auth0Id)
      .single();

    if (userError || !user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get all badges
    const { data: allBadges, error: badgesError } = await supabase
      .from('badges')
      .select('*')
      .order('badge_type', { ascending: true })
      .order('requirement_value', { ascending: true });

    if (badgesError || !allBadges) {
      return NextResponse.json({ error: 'Failed to fetch badges' }, { status: 500 });
    }

    // Get user's earned badges
    const { data: earnedBadges, error: earnedError } = await supabase
      .from('user_badges')
      .select('badge_id, earned_at')
      .eq('user_id', user.id);

    const earnedMap = new Map(
      earnedBadges?.map((eb) => [eb.badge_id, eb.earned_at]) || [],
    );

    // Combine badges with earned status
    const badgesWithStatus = allBadges.map((badge) => ({
      ...badge,
      earned_at: earnedMap.get(badge.id) || undefined,
    }));

    return NextResponse.json({ badges: badgesWithStatus });
  } catch (error) {
    console.error('Unexpected error fetching badges:', error);
    return NextResponse.json({ error: 'Unexpected error' }, { status: 500 });
  }
}

