import { NextResponse } from 'next/server';
import { getSession } from '@auth0/nextjs-auth0';
import { supabase } from '@/lib/supabase';

/**
 * Get active weekly challenges
 */
export async function GET() {
  try {
    const today = new Date().toISOString().split('T')[0];

    // Get active challenges (current or upcoming)
    const { data: challenges, error } = await supabase
      .from('challenges')
      .select(`
        *,
        challenge_actions (
          day_number,
          actions (
            id,
            name,
            description,
            icon,
            benefit
          )
        )
      `)
      .eq('is_active', true)
      .gte('end_date', today) // Not ended yet
      .order('start_date', { ascending: true })
      .limit(3);

    if (error) {
      console.error('Error fetching challenges:', error);
      return NextResponse.json({ error: 'Failed to fetch challenges' }, { status: 500 });
    }

    return NextResponse.json({ challenges: challenges || [] });
  } catch (error) {
    console.error('Unexpected error fetching challenges:', error);
    return NextResponse.json({ error: 'Unexpected error' }, { status: 500 });
  }
}

