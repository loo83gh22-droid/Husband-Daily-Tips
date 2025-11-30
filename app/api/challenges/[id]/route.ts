import { NextResponse } from 'next/server';
import { getSession } from '@auth0/nextjs-auth0';
import { getSupabaseAdmin } from '@/lib/supabase';

/**
 * Get a single challenge by ID
 */
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession();

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const challengeId = params.id;

    if (!challengeId) {
      return NextResponse.json({ error: 'Missing challenge ID' }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();

    // Get challenge
    const { data: challenge, error } = await supabase
      .from('challenges')
      .select('id, name, description, theme')
      .eq('id', challengeId)
      .single();

    if (error || !challenge) {
      return NextResponse.json({ error: 'Challenge not found' }, { status: 404 });
    }

    return NextResponse.json(challenge);
  } catch (error) {
    console.error('Error fetching challenge:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

