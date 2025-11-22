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
  console.log('=== Outstanding Actions API Called ===');
  console.log('Request URL:', request.url);
  
  try {
    console.log('Getting session...');
    const session = await getSession();
    console.log('Session obtained:', session ? 'Yes' : 'No');

    if (!session?.user) {
      console.log('No session user, returning 401');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('Session user ID:', session.user.sub);
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    console.log('User ID from query:', userId);

    if (!userId) {
      return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();
    const today = new Date().toISOString().split('T')[0];

    // Get outstanding actions: not completed, not DNC, date <= today
    // This includes both regular actions AND challenge actions
    // Order by date ascending (oldest first) - allows users to catch up chronologically
    let outstandingActions;
    let error;
    
    try {
      const result = await supabase
        .from('user_daily_actions')
        .select('id, user_id, action_id, date, completed, dnc')
        .eq('user_id', userId)
        .eq('completed', false)
        .eq('dnc', false)
        .lte('date', today)
        .order('date', { ascending: true })
        .limit(30); // Limit to 30 actions to allow catching up on missed days
      
      outstandingActions = result.data;
      error = result.error;
    } catch (queryError: any) {
      console.error('Exception during query:', queryError);
      return NextResponse.json({ 
        error: 'Query exception', 
        details: queryError?.message || 'Unknown query error',
        stack: process.env.NODE_ENV === 'development' ? queryError?.stack : undefined
      }, { status: 500 });
    }

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
    
    console.log('Outstanding actions count:', outstandingActions.length);
    console.log('Unique action IDs count:', actionIds.length);
    console.log('Action IDs:', actionIds);
    
    if (actionIds.length === 0) {
      console.warn('No valid action IDs found in outstanding actions');
      return NextResponse.json({ actions: [] });
    }
    
    // Fetch actions separately
    let actions;
    let actionsError;
    try {
      const result = await supabase
        .from('actions')
        .select('id, name, description, icon, category')
        .in('id', actionIds);
      actions = result.data;
      actionsError = result.error;
    } catch (queryError: any) {
      console.error('Exception during actions query:', queryError);
      return NextResponse.json({ 
        error: 'Actions query exception', 
        details: queryError?.message || 'Unknown query error'
      }, { status: 500 });
    }

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

