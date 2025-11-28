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

    // Get user with subscription info
    const { data: user, error: userError } = await adminSupabase
      .from('users')
      .select('id, subscription_tier, trial_ends_at, stripe_subscription_id')
      .eq('auth0_id', auth0Id)
      .single();

    if (userError || !user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Check if user has premium access (paid subscription or active trial)
    const trialEndsAt = user?.trial_ends_at ? new Date(user.trial_ends_at) : null;
    const now = new Date();
    const hasActiveTrial = user?.subscription_tier === 'premium' && 
                          trialEndsAt && 
                          trialEndsAt > now && 
                          !user?.stripe_subscription_id;
    const hasSubscription = !!user?.stripe_subscription_id;
    const isOnPremium = user?.subscription_tier === 'premium' && hasSubscription;
    const hasPremiumAccess = isOnPremium || hasActiveTrial;

    // Hide actions is a premium feature
    if (!hasPremiumAccess) {
      return NextResponse.json(
        { 
          error: 'Premium required',
          message: 'Hiding actions is a Premium feature. Upgrade to personalize your experience.'
        },
        { status: 403 }
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

    // Get user with subscription info
    const { data: user, error: userError } = await adminSupabase
      .from('users')
      .select('id, subscription_tier, trial_ends_at, stripe_subscription_id')
      .eq('auth0_id', auth0Id)
      .single();

    if (userError || !user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Check if user has premium access (paid subscription or active trial)
    const trialEndsAt = user?.trial_ends_at ? new Date(user.trial_ends_at) : null;
    const now = new Date();
    const hasActiveTrial = user?.subscription_tier === 'premium' && 
                          trialEndsAt && 
                          trialEndsAt > now && 
                          !user?.stripe_subscription_id;
    const hasSubscription = !!user?.stripe_subscription_id;
    const isOnPremium = user?.subscription_tier === 'premium' && hasSubscription;
    const hasPremiumAccess = isOnPremium || hasActiveTrial;

    // Hide actions is a premium feature
    if (!hasPremiumAccess) {
      return NextResponse.json(
        { 
          error: 'Premium required',
          message: 'Unhiding actions is a Premium feature. Upgrade to personalize your experience.'
        },
        { status: 403 }
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

