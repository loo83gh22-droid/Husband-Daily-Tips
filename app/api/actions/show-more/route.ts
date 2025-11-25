import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@auth0/nextjs-auth0';
import { getSupabaseAdmin } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

// Increment category preference when user clicks "Show me more like this"
export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { actionId } = await request.json();

    if (!actionId) {
      return NextResponse.json(
        { error: 'Action ID is required' },
        { status: 400 }
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

    // Get the action to find its category
    const { data: action, error: actionError } = await adminSupabase
      .from('actions')
      .select('category')
      .eq('id', actionId)
      .single();

    if (actionError || !action) {
      return NextResponse.json(
        { error: 'Action not found' },
        { status: 404 }
      );
    }

    // Increment preference weight for this category
    const { data: result, error: prefError } = await adminSupabase
      .rpc('increment_category_preference', {
        p_user_id: user.id,
        p_category: action.category,
      });

    if (prefError) {
      console.error('Error incrementing preference:', prefError);
      return NextResponse.json(
        { error: 'Failed to update preference' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Preference updated successfully',
      newWeight: result,
    });
  } catch (error: any) {
    console.error('Error in show more endpoint:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Get user's category preferences
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

    // Get all category preferences
    const { data: preferences, error: prefError } = await adminSupabase
      .from('user_category_preferences')
      .select('category, preference_weight')
      .eq('user_id', user.id);

    if (prefError) {
      console.error('Error fetching preferences:', prefError);
      return NextResponse.json(
        { error: 'Failed to fetch preferences' },
        { status: 500 }
      );
    }

    // Convert to object for easier access
    const preferencesMap: Record<string, number> = {};
    preferences?.forEach((pref) => {
      preferencesMap[pref.category] = parseFloat(pref.preference_weight.toString());
    });

    return NextResponse.json({
      preferences: preferencesMap,
    });
  } catch (error: any) {
    console.error('Error in get preferences endpoint:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

