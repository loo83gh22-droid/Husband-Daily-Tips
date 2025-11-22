import { NextResponse } from 'next/server';
import { getSession } from '@auth0/nextjs-auth0';
import { getSupabaseAdmin } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

/**
 * Get user's action completion dates
 * GET /api/actions/completions?userId=xxx&days=90
 */
export async function GET(request: Request) {
  try {
    const session = await getSession();

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const days = parseInt(searchParams.get('days') || '90', 10);

    if (!userId) {
      return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
    }

    const adminSupabase = getSupabaseAdmin();
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    const cutoffDateStr = cutoffDate.toISOString().split('T')[0];

    const { data: completions, error } = await adminSupabase
      .from('user_daily_actions')
      .select('date')
      .eq('user_id', userId)
      .eq('completed', true)
      .gte('date', cutoffDateStr)
      .order('date', { ascending: true });

    if (error) {
      console.error('Error fetching completions:', error);
      return NextResponse.json({ error: 'Failed to fetch completions' }, { status: 500 });
    }

    return NextResponse.json({ completions: completions || [] });
  } catch (error: any) {
    console.error('Unexpected error fetching completions:', error);
    return NextResponse.json({ error: 'Unexpected error' }, { status: 500 });
  }
}

