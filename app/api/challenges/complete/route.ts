import { NextResponse } from 'next/server';
import { getSession } from '@auth0/nextjs-auth0';
import { getSupabaseAdmin } from '@/lib/supabase';
import { checkAndAwardBadges } from '@/lib/badges';

/**
 * Mark a challenge as complete or incomplete
 */
export async function POST(request: Request) {
  try {
    const session = await getSession();

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const auth0Id = session.user.sub;
    const body = await request.json();
    const { challengeId, notes, linkToJournal } = body;

    if (!challengeId) {
      return NextResponse.json({ error: 'Missing challengeId' }, { status: 400 });
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

    // Get challenge
    const { data: challenge, error: challengeError } = await supabase
      .from('challenges')
      .select('*')
      .eq('id', challengeId)
      .single();

    if (challengeError || !challenge) {
      return NextResponse.json({ error: 'Challenge not found' }, { status: 404 });
    }

    // Create journal entry if notes provided and linkToJournal is true
    let journalEntryId: string | null = null;
    if (linkToJournal && notes) {
      const { data: journalEntry, error: journalError } = await supabase
        .from('reflections')
        .insert({
          user_id: user.id,
          content: `Challenge: ${challenge.name}\n\n${notes}`,
          shared_to_forum: false,
        })
        .select('id')
        .single();

      if (!journalError && journalEntry) {
        journalEntryId = journalEntry.id;
      }
    }

    // Mark as complete (allow multiple completions)
    const { data: completion, error: insertError } = await supabase
      .from('user_challenge_completions')
      .insert({
        user_id: user.id,
        challenge_id: challengeId,
        notes: notes || null,
        journal_entry_id: journalEntryId,
      })
      .select('id')
      .single();

    if (insertError) {
      console.error('Error completing challenge:', insertError);
      return NextResponse.json(
        { error: 'Failed to complete challenge' },
        { status: 500 },
      );
    }

    // Check for badge progress (if challenge has requirement_type)
    if (challenge.requirement_type) {
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

          // Get ALL challenge completions (including the one we just added)
          // Count each completion instance (not just unique challenges)
          const { data: challengeCompletions } = await supabase
            .from('user_challenge_completions')
            .select('challenges(requirement_type)')
            .eq('user_id', user.id);

          const challengeCounts: Record<string, number> = {};
          challengeCompletions?.forEach((cc: any) => {
            const reqType = cc.challenges?.requirement_type;
            if (reqType) {
              // Count each instance (multiple completions of same challenge count multiple times)
              challengeCounts[reqType] = (challengeCounts[reqType] || 0) + 1;
            }
          });

      // Check badges with updated challenge counts
      const newlyEarned = await checkAndAwardBadges(
        supabase,
        user.id,
        {
          totalTips,
          currentStreak: streak,
          totalDays: uniqueDays,
          challengeCounts,
        },
        challenge.category,
      );

      // Return newly earned badges if any
      if (newlyEarned.length > 0) {
        return NextResponse.json({
          success: true,
          newlyEarnedBadges: newlyEarned.map((n) => ({
            name: n.badge.name,
            description: n.badge.description,
            icon: n.badge.icon,
            healthBonus: n.healthBonus,
          })),
        });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Unexpected error completing challenge:', error);
    return NextResponse.json({ error: 'Unexpected error' }, { status: 500 });
  }
}

/**
 * Mark a challenge as incomplete (uncomplete)
 */
export async function DELETE(request: Request) {
  try {
    const session = await getSession();

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const auth0Id = session.user.sub;
    const { challengeId } = await request.json();

    if (!challengeId) {
      return NextResponse.json({ error: 'Missing challengeId' }, { status: 400 });
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
      .from('user_challenge_completions')
      .delete()
      .eq('user_id', user.id)
      .eq('challenge_id', challengeId);

    if (deleteError) {
      console.error('Error uncompleting challenge:', deleteError);
      return NextResponse.json(
        { error: 'Failed to uncomplete challenge' },
        { status: 500 },
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Unexpected error uncompleting challenge:', error);
    return NextResponse.json({ error: 'Unexpected error' }, { status: 500 });
  }
}

