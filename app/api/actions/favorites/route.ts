import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@auth0/nextjs-auth0';
import { getSupabaseAdmin } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

// Get all favorited actions for the current user
export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const auth0Id = session.user.sub;
    const adminSupabase = getSupabaseAdmin();

    // Get user ID
    const { data: user, error: userError } = await adminSupabase
      .from('users')
      .select('id')
      .eq('auth0_id', auth0Id)
      .single();

    if (userError || !user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Get favorited actions with full action details
    const { data: favoritedActionsData, error: favoritesError } = await adminSupabase
      .from('user_daily_actions')
      .select(`
        id,
        date,
        favorited,
        actions (
          id,
          name,
          description,
          category,
          theme,
          icon,
          benefit,
          requirement_type
        )
      `)
      .eq('user_id', user.id)
      .eq('favorited', true)
      .order('date', { ascending: false });

    if (favoritesError) {
      console.error('Error fetching favorites:', favoritesError);
      return NextResponse.json(
        { error: 'Failed to fetch favorites' },
        { status: 500 }
      );
    }

    // Extract unique favorited actions (by action_id)
    const favoritedActionIds = new Set<string>();
    const favorites = favoritedActionsData
      ?.filter((fad: any) => {
        const actionId = fad.actions?.id;
        if (!actionId || !fad.actions || favoritedActionIds.has(actionId)) return false;
        favoritedActionIds.add(actionId);
        return true;
      })
      .map((fad: any) => ({
        ...fad.actions,
        favoritedDate: fad.date,
      }))
      .filter((action: any) => action && action.id) || [];

    return NextResponse.json({
      favorites,
      count: favorites.length,
    });
  } catch (error: any) {
    console.error('Error in get favorites endpoint:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

