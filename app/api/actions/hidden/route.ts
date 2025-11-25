import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@auth0/nextjs-auth0';
import { getSupabaseAdmin } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

// Get all hidden actions for the current user
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

    // Get hidden actions with full action details
    const { data: hiddenActions, error: hiddenError } = await adminSupabase
      .from('user_hidden_actions')
      .select(`
        id,
        hidden_at,
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
      .order('hidden_at', { ascending: false });

    if (hiddenError) {
      console.error('Error fetching hidden actions:', hiddenError);
      return NextResponse.json(
        { error: 'Failed to fetch hidden actions' },
        { status: 500 }
      );
    }

    // Transform the data to make it easier to work with
    const formattedActions = hiddenActions
      ?.filter((ha: any) => ha.actions) // Filter out any null actions
      .map((ha: any) => ({
        hiddenId: ha.id,
        hiddenAt: ha.hidden_at,
        ...ha.actions,
      })) || [];

    return NextResponse.json({
      hiddenActions: formattedActions,
      count: formattedActions.length,
    });
  } catch (error: any) {
    console.error('Error in get hidden actions endpoint:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

