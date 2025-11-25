import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@auth0/nextjs-auth0';
import { getSupabaseAdmin } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

// Hide an action (don't show again)
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

    // Hide the action (upsert to handle duplicates gracefully)
    const { error: hideError } = await adminSupabase
      .from('user_hidden_actions')
      .upsert({
        user_id: user.id,
        action_id: actionId,
      }, {
        onConflict: 'user_id,action_id',
      });

    if (hideError) {
      console.error('Error hiding action:', hideError);
      return NextResponse.json(
        { error: 'Failed to hide action' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Action hidden successfully',
    });
  } catch (error: any) {
    console.error('Error in hide action endpoint:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Unhide an action (show again)
export async function DELETE(request: NextRequest) {
  try {
    const session = await getSession();
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const actionId = searchParams.get('actionId');

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

    // Unhide the action
    const { error: unhideError } = await adminSupabase
      .from('user_hidden_actions')
      .delete()
      .eq('user_id', user.id)
      .eq('action_id', actionId);

    if (unhideError) {
      console.error('Error unhiding action:', unhideError);
      return NextResponse.json(
        { error: 'Failed to unhide action' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Action unhidden successfully',
    });
  } catch (error: any) {
    console.error('Error in unhide action endpoint:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

