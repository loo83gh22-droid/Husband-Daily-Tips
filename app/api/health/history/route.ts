import { NextResponse } from 'next/server';
import { getSession } from '@auth0/nextjs-auth0';
import { getSupabaseAdmin } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

/**
 * Get user's health score history
 * GET /api/health/history?days=30
 */
export async function GET(request: Request) {
  try {
    const session = await getSession();

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const auth0Id = session.user.sub;
    const adminSupabase = getSupabaseAdmin();

    const { data: user } = await adminSupabase
      .from('users')
      .select('id')
      .eq('auth0_id', auth0Id)
      .single();

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get('days') || '30', 10);
    // userId param is not needed - we get it from the session

    // Get user's daily action completions to calculate historical health
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    const cutoffDateStr = cutoffDate.toISOString().split('T')[0];

    const { data: completions } = await adminSupabase
      .from('user_daily_actions')
      .select('date, completed')
      .eq('user_id', user.id)
      .gte('date', cutoffDateStr)
      .order('date', { ascending: true });

    // Get baseline health from survey
    const { data: surveySummary } = await adminSupabase
      .from('survey_summary')
      .select('baseline_health')
      .eq('user_id', user.id)
      .single();

    const baselineHealth = surveySummary?.baseline_health || 50;

    // Calculate health for each day
    const healthHistory: Array<{ date: string; health: number }> = [];
    const completedDates = new Set(completions?.filter(c => c.completed).map(c => c.date) || []);
    
    // Get unique days with completions
    const uniqueDays = new Set(completions?.filter(c => c.completed).map(c => c.date) || []);
    let streak = 0;
    let totalCompletions = 0;

    // Generate health for each day
    for (let i = days; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      if (completedDates.has(dateStr)) {
        totalCompletions++;
        streak++;
      } else {
        streak = 0;
      }

      // Simple health calculation: baseline + improvements from completions
      // Each completion adds ~0.5 points, capped at 40 improvement points
      const improvementPoints = Math.min(40, totalCompletions * 0.5);
      const health = Math.min(100, baselineHealth + improvementPoints);

      healthHistory.push({ date: dateStr, health });
    }

    return NextResponse.json({ history: healthHistory });
  } catch (error: any) {
    console.error('Error fetching health history:', error);
    return NextResponse.json({ error: 'Failed to fetch health history' }, { status: 500 });
  }
}

