import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

/**
 * Get challenge actions for a specific challenge
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: challengeId } = await params;

    if (!challengeId) {
      return NextResponse.json({ error: 'Challenge ID required' }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();

    const { data: challenge, error } = await supabase
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
      .eq('id', challengeId)
      .single();

    if (error || !challenge) {
      return NextResponse.json({ error: 'Challenge not found' }, { status: 404 });
    }

    return NextResponse.json({
      challenge_actions: challenge.challenge_actions || [],
    });
  } catch (error) {
    console.error('Error fetching challenge actions:', error);
    return NextResponse.json({ error: 'Unexpected error' }, { status: 500 });
  }
}

