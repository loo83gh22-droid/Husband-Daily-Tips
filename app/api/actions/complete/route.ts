import { NextResponse } from 'next/server';
import { getSession } from '@auth0/nextjs-auth0';
import { getSupabaseAdmin } from '@/lib/supabase';
import { checkAndAwardBadges } from '@/lib/badges';

/**
 * Mark an action as complete
 */
export async function POST(request: Request) {
  try {
    const session = await getSession();

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const auth0Id = session.user.sub;
    const body = await request.json();
    const { actionId, notes, linkToJournal, shareToForum } = body;

    if (!actionId) {
      return NextResponse.json({ error: 'Missing actionId' }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();

    // Get user with subscription info
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, subscription_tier, trial_started_at, trial_ends_at, stripe_subscription_id')
      .eq('auth0_id', auth0Id)
      .single();

    if (userError || !user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get action
    const { data: action, error: actionError } = await supabase
      .from('actions')
      .select('*')
      .eq('id', actionId)
      .single();

    if (actionError || !action) {
      return NextResponse.json({ error: 'Action not found' }, { status: 404 });
    }

    // Check subscription status for free users
    const trialEndsAt = user?.trial_ends_at ? new Date(user.trial_ends_at) : null;
    const trialStartedAt = user?.trial_started_at ? new Date(user.trial_started_at) : null;
    const now = new Date();
    // Active trial: premium tier, has trial dates, trial hasn't ended, and no paid subscription
    const hasActiveTrial = user?.subscription_tier === 'premium' && 
                          trialStartedAt && 
                          trialEndsAt && 
                          trialEndsAt > now && 
                          !user?.stripe_subscription_id;
    const hasSubscription = !!user?.stripe_subscription_id;
    const isOnPremium = user?.subscription_tier === 'premium' && hasSubscription;
    const hasPremiumAccess = isOnPremium || hasActiveTrial;

    // Check if free user is trying to share to forum
    if (shareToForum && user.subscription_tier === 'free') {
      return NextResponse.json(
        { error: 'Upgrade to Paid to share your wins to Team Wins' },
        { status: 403 }
      );
    }

    // Check if this action is the user's daily served action
    const today = new Date().toISOString().split('T')[0];
    const { data: dailyAction } = await supabase
      .from('user_daily_actions')
      .select('id')
      .eq('user_id', user.id)
      .eq('action_id', actionId)
      .eq('date', today)
      .single();

    // If not the daily action and user doesn't have premium, block completion
    if (!dailyAction && !hasPremiumAccess) {
      return NextResponse.json(
        { 
          error: 'Premium required',
          message: 'Free users can only complete the daily action served on the dashboard. Upgrade to Premium to complete any action from the Actions page.'
        },
        { status: 403 }
      );
    }

    // Always create journal entry for action completions
    // This is the running record of all action completions
    let journalEntryId: string | null = null;
    // Only store the notes - action name is displayed separately in the journal entry
    const journalContent = notes?.trim() || '';
    
    const { data: journalEntry, error: journalError } = await supabase
      .from('reflections')
      .insert({
        user_id: user.id,
        content: journalContent,
        shared_to_forum: shareToForum || false,
      })
      .select('id')
      .single();

    if (!journalError && journalEntry) {
      journalEntryId = journalEntry.id;

      // If shared to forum, create a Deep Thought post with action name
      if (shareToForum && journalEntry) {
        await supabase.from('deep_thoughts').insert({
          reflection_id: journalEntry.id,
          user_id: user.id,
          title: action.name, // Store action name in title field
          content: journalContent || '',
          tip_category: action.category || null,
        });
      }
    } else if (journalError) {
      console.error('Error creating journal entry:', journalError);
      // Continue anyway - don't fail the action completion if journal fails
    }

    // Mark as complete (allow multiple completions)
    const { data: completion, error: insertError } = await supabase
      .from('user_action_completions')
      .insert({
        user_id: user.id,
        action_id: actionId,
        notes: notes || null,
        journal_entry_id: journalEntryId,
      })
      .select('id')
      .single();

    if (insertError) {
      console.error('Error completing action:', {
        error: insertError,
        code: insertError.code,
        message: insertError.message,
        details: insertError.details,
        hint: insertError.hint,
        user_id: user.id,
        action_id: actionId,
        journal_entry_id: journalEntryId,
      });
      
      // Provide more specific error message based on error type
      let errorMessage = 'Failed to complete action';
      if (insertError.code === '23505') {
        errorMessage = 'This action has already been completed';
      } else if (insertError.code === '23503') {
        errorMessage = 'Invalid action or user data';
      } else if (insertError.message?.includes('timeout') || insertError.message?.includes('network')) {
        errorMessage = 'Network error. Please check your connection and try again';
      }
      
      return NextResponse.json(
        { error: errorMessage, details: insertError.message },
        { status: 500 },
      );
    }

    // Mark as completed in user_daily_actions for ANY date (not just today)
    // This allows users to catch up on missed days - they can complete past actions
    const { data: dailyActions } = await supabase
      .from('user_daily_actions')
      .select('id, date, dnc')
      .eq('user_id', user.id)
      .eq('action_id', actionId)
      .eq('completed', false)
      .order('date', { ascending: false })
      .limit(1); // Get the most recent incomplete action for this action_id

    if (dailyActions && dailyActions.length > 0) {
      const dailyAction = dailyActions[0];
      const actionDate = dailyAction.date; // Use the date of the action being completed
      
      // Mark as completed (can be any date - allows catch-up)
      await supabase
        .from('user_daily_actions')
        .update({ completed: true })
        .eq('id', dailyAction.id);

      // REVERSE DECAY: If this action was assigned on a past date and decay was applied,
      // remove the decay entry to restore the health points
      // Only reverse if action is NOT marked as DNC (Did Not Complete)
      if (dailyAction.dnc === false || dailyAction.dnc === null) {
        // Check if decay was applied for this date
        const { data: decayEntry } = await supabase
          .from('health_decay_log')
          .select('id, decay_applied')
          .eq('user_id', user.id)
          .eq('missed_date', actionDate)
          .single();

        if (decayEntry) {
          // Remove the decay entry to restore health points
          await supabase
            .from('health_decay_log')
            .delete()
            .eq('id', decayEntry.id);
        }
      }

      // Calculate action points using Option 1: Conservative & Steady algorithm
      // Get action point value (for compatibility, not used in Option 1)
      const actionPointValue = action.health_point_value || 2;
      
      // Use recordActionCompletion which handles daily/weekly distinction and caps
      try {
        const { recordActionCompletion } = await import('@/lib/health');
        await recordActionCompletion(
          supabase,
          user.id,
          actionId,
          actionPointValue,
          actionDate
        );
      } catch (healthError: any) {
        console.error('Error recording action completion for health:', {
          error: healthError,
          user_id: user.id,
          action_id: actionId,
          actionDate,
        });
        // Don't fail the action completion if health recording fails
        // The action is already marked as complete
      }
    }

    // Check for badge progress (if action has requirement_type)
    if (action.requirement_type) {
      // Get user stats for badge checking
      const { data: tips } = await supabase
        .from('user_tips')
        .select('date, tips(category)')
        .eq('user_id', user.id);

      const totalTips = tips?.length || 0;
      const uniqueDays = new Set(tips?.map((t) => t.date)).size;

      // Calculate streak
      let streak = 0;
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      for (let i = 0; i < 365; i++) {
        const checkDate = new Date(today);
        checkDate.setDate(today.getDate() - i);
        const dateStr = checkDate.toISOString().split('T')[0];

        if (tips?.some((t) => t.date === dateStr)) {
          streak++;
        } else {
          break;
        }
      }

      // Get ALL action completions (including the one we just added)
      // Count each completion instance (not just unique actions)
      const { data: actionCompletions } = await supabase
        .from('user_action_completions')
        .select('actions(requirement_type)')
        .eq('user_id', user.id);

      const actionCounts: Record<string, number> = {};
      actionCompletions?.forEach((ac: any) => {
        const reqType = ac.actions?.requirement_type;
        if (reqType) {
          // Count each instance (multiple completions of same action count multiple times)
          actionCounts[reqType] = (actionCounts[reqType] || 0) + 1;
        }
      });

      // Check badges with updated action counts
      let newlyEarned: any[] = [];
      try {
        newlyEarned = await checkAndAwardBadges(
          supabase,
          user.id,
          {
            totalTips,
            currentStreak: streak,
            totalDays: uniqueDays,
            actionCounts, // Now using actionCounts directly
          },
          action.category,
        );
      } catch (badgeError: any) {
        console.error('Error checking badges:', {
          error: badgeError,
          user_id: user.id,
          action_id: actionId,
        });
        // Don't fail the action completion if badge checking fails
        // The action is already marked as complete
      }

      // Return newly earned badges if any
      if (newlyEarned.length > 0) {
        return NextResponse.json({
          success: true,
          newlyEarnedBadges: newlyEarned.map((n) => ({
            name: n.badge.name,
            description: n.badge.description,
            icon: n.badge.icon,
          })),
        });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Unexpected error completing action:', {
      error: error?.message || error,
      stack: error?.stack,
      name: error?.name,
    });
    
    // Provide more helpful error message
    let errorMessage = 'An unexpected error occurred';
    if (error?.message?.includes('timeout') || error?.message?.includes('network')) {
      errorMessage = 'Network error. Please check your connection and try again';
    } else if (error?.message?.includes('fetch')) {
      errorMessage = 'Connection error. Please try again';
    }
    
    return NextResponse.json(
      { error: errorMessage, details: error?.message },
      { status: 500 }
    );
  }
}

/**
 * Mark an action as incomplete (uncomplete)
 */
export async function DELETE(request: Request) {
  try {
    const session = await getSession();

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const auth0Id = session.user.sub;
    const { actionId } = await request.json();

    if (!actionId) {
      return NextResponse.json({ error: 'Missing actionId' }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();

    // Get user
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('auth0_id', auth0Id)
      .single();

    if (userError || !user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Remove completion
    const { error: deleteError } = await supabase
      .from('user_action_completions')
      .delete()
      .eq('user_id', user.id)
      .eq('action_id', actionId);

    if (deleteError) {
      console.error('Error uncompleting action:', deleteError);
      return NextResponse.json(
        { error: 'Failed to uncomplete action' },
        { status: 500 },
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Unexpected error uncompleting action:', error);
    return NextResponse.json({ error: 'Unexpected error' }, { status: 500 });
  }
}

