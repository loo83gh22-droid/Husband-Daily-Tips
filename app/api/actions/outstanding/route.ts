import { NextResponse } from 'next/server';
import { getSession } from '@auth0/nextjs-auth0';
import { getSupabaseAdmin } from '@/lib/supabase';

// Force dynamic rendering since we use cookies for authentication
export const dynamic = 'force-dynamic';

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
      .select('id, user_id, action_id, date, completed, dnc')
      .eq('user_id', userId)
      .eq('completed', false)
      .eq('dnc', false)
      .lte('date', today)
      .order('date', { ascending: true })
      .limit(30); // Limit to 30 actions to allow catching up on missed days

    if (error) {
      console.error('Error fetching outstanding actions:', error);
      console.error('Error details:', JSON.stringify(error, null, 2));
      console.error('Error code:', error.code);
      console.error('Error hint:', error.hint);
      return NextResponse.json({ 
        error: 'Failed to fetch outstanding actions', 
        details: error.message,
        code: error.code,
        hint: error.hint
      }, { status: 500 });
    }

    if (!outstandingActions || outstandingActions.length === 0) {
      return NextResponse.json({ actions: [] });
    }

    // Get unique action IDs (filter out any null/undefined values)
    const actionIds = Array.from(new Set(
      outstandingActions
        .map(oa => oa.action_id)
        .filter((id): id is string => id != null && id !== '')
    ));
    
    if (actionIds.length === 0) {
      console.warn('No valid action IDs found in outstanding actions');
      return NextResponse.json({ actions: [] });
    }
    
    // Fetch actions separately
    const { data: actions, error: actionsError } = await supabase
      .from('actions')
      .select('id, name, description, icon, category')
      .in('id', actionIds);

    if (actionsError) {
      console.error('Error fetching actions:', actionsError);
      return NextResponse.json({ 
        error: 'Failed to fetch actions', 
        details: actionsError.message
      }, { status: 500 });
    }

    // Create a map of action_id -> action for quick lookup
    const actionsMap = new Map(
      (actions || []).map(action => [action.id, action])
    );

    // Format the response by joining user_daily_actions with actions
    try {
      const formattedActions = outstandingActions
        .map((oa) => {
          const action = actionsMap.get(oa.action_id);
          
          if (!action) {
            console.warn('Action not found for action_id:', oa.action_id, 'user_daily_action_id:', oa.id);
            return null;
          }
          
          return {
            id: action.id,
            user_daily_actions_id: oa.id,
            action_id: oa.action_id,
            date: oa.date,
            name: action.name || '',
            description: action.description || '',
            icon: action.icon || '',
            category: action.category || '',
          };
        })
        .filter((action): action is NonNullable<typeof action> => action !== null); // Remove any null entries

      return NextResponse.json({ actions: formattedActions });
    } catch (mappingError: any) {
      console.error('Error in mapping outstanding actions:', mappingError);
      console.error('Outstanding actions data:', JSON.stringify(outstandingActions, null, 2));
      console.error('Actions map size:', actionsMap.size);
      return NextResponse.json({ 
        error: 'Error processing outstanding actions', 
        details: mappingError?.message || 'Unknown mapping error'
      }, { status: 500 });
    }
  } catch (error: any) {
    console.error('Unexpected error fetching outstanding actions:', error);
    console.error('Error stack:', error?.stack);
    return NextResponse.json({ 
      error: 'Unexpected error', 
      details: error?.message || 'Unknown error',
      stack: process.env.NODE_ENV === 'development' ? error?.stack : undefined
    }, { status: 500 });
  }
}

