import { NextResponse } from 'next/server';
import { getSession } from '@auth0/nextjs-auth0';
import { getSupabaseAdmin } from '@/lib/supabase';

/**
 * Get outstanding (incomplete) actions for a user
 * Returns actions that are not completed and not marked as DNC
 */
export async function GET(request: Request) {
  try {
    const session = await getSession();

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();
    const today = new Date().toISOString().split('T')[0];

    // Get outstanding actions: not completed, not DNC, date <= today
    // This includes both regular actions AND challenge actions
    // Order by date ascending (oldest first) - allows users to catch up chronologically
    const { data: outstandingActions, error } = await supabase
      .from('user_daily_actions')
      .select(`
        id,
        user_id,
        action_id,
        date,
        completed,
        dnc,
        actions (
          id,
          name,
          description,
          icon,
          category
        )
      `)
      .eq('user_id', userId)
      .eq('completed', false)
      .eq('dnc', false)
      .lte('date', today)
      .order('date', { ascending: true })
      .limit(30); // Limit to 30 actions to allow catching up on missed days

    if (error) {
      console.error('Error fetching outstanding actions:', error);
      return NextResponse.json({ error: 'Failed to fetch outstanding actions' }, { status: 500 });
    }

    // Format the response
    // Handle both single object and array responses from Supabase
    const actions = (outstandingActions || [])
      .filter((oa) => oa.actions != null) // Filter out any null actions
      .map((oa: any) => {
        // Supabase relation can return single object or array - handle both cases
        const action = Array.isArray(oa.actions) ? oa.actions[0] : oa.actions;
        if (!action) return null; // Skip if action is still null/undefined
        
        return {
          id: action.id,
          user_daily_actions_id: oa.id,
          action_id: oa.action_id,
          date: oa.date,
          name: action.name,
          description: action.description,
          icon: action.icon,
          category: action.category,
        };
      })
      .filter((action) => action !== null); // Remove any null entries

    return NextResponse.json({ actions });
  } catch (error) {
    console.error('Unexpected error fetching outstanding actions:', error);
    return NextResponse.json({ error: 'Unexpected error' }, { status: 500 });
  }
}

