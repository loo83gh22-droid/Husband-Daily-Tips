import { NextResponse } from 'next/server';
import { getSession } from '@auth0/nextjs-auth0';
import { getSupabaseAdmin } from '@/lib/supabase';

/**
 * Join a weekly challenge
 */
export async function POST(request: Request) {
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

    // Use admin client to bypass RLS (Auth0 context isn't set)
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

    // Check if challenge exists and is active
    const { data: challenge, error: challengeError } = await supabase
      .from('challenges')
      .select('*')
      .eq('id', challengeId)
      .eq('is_active', true)
      .single();

    if (challengeError || !challenge) {
      return NextResponse.json({ error: 'Challenge not found or not active' }, { status: 404 });
    }

    const today = new Date().toISOString().split('T')[0];

    // Check if user already joined this specific challenge
    const { data: existing } = await supabase
      .from('user_challenges')
      .select('id')
      .eq('user_id', user.id)
      .eq('challenge_id', challengeId)
      .single();

    if (existing) {
      return NextResponse.json({ success: true, message: 'Already joined challenge' });
    }

    // Check if user already has an active (incomplete) challenge
    const { data: activeChallenges, error: activeError } = await supabase
      .from('user_challenges')
      .select('id, challenges(name)')
      .eq('user_id', user.id)
      .eq('completed', false);

    if (activeChallenges && activeChallenges.length > 0) {
      const challengeName = (activeChallenges[0].challenges as any)?.name || 'another challenge';
      return NextResponse.json(
        { 
          error: 'You can only join one challenge at a time',
          message: `You're currently participating in "${challengeName}". Complete it before joining a new challenge.`,
          challengeName: challengeName,
          challenge_name: challengeName
        },
        { status: 400 }
      );
    }

    // When joining a new challenge, mark any other active challenges as inactive
    // Only one challenge should be active at a time
    await supabase
      .from('user_challenges')
      .update({ completed: true })
      .eq('user_id', user.id)
      .eq('completed', false)
      .neq('challenge_id', challengeId);

    // Join challenge
    const { data: userChallenge, error: joinError } = await supabase
      .from('user_challenges')
      .insert({
        user_id: user.id,
        challenge_id: challengeId,
        joined_date: today,
        completed_days: 0,
        completed: false,
      })
      .select()
      .single();

    if (joinError) {
      console.error('Error joining challenge:', joinError);
      return NextResponse.json({ error: 'Failed to join challenge' }, { status: 500 });
    }

    // If this is a 7-day challenge, automatically assign 7 days of actions
    // This ensures the challenge actions are locked in and take precedence
    if (challenge && challenge.duration_days === 7) {
      try {
        const { getSupabaseAdmin } = await import('@/lib/supabase');
        const adminSupabase = getSupabaseAdmin();

        // Get user's survey data for personalization
        const { data: surveySummary } = await adminSupabase
          .from('survey_summary')
          .select('communication_score, romance_score, partnership_score, intimacy_score, conflict_score')
          .eq('user_id', user.id)
          .single();

        const categoryScores = surveySummary || {};
        let assignedCount = 0;

        for (let i = 0; i < 7; i++) {
          const targetDate = new Date(today);
          targetDate.setDate(new Date(today).getDate() + i);
          const dateStr = targetDate.toISOString().split('T')[0];

          // Check if action already exists
          const { data: existingAction } = await adminSupabase
            .from('user_daily_actions')
            .select('action_id')
            .eq('user_id', user.id)
            .eq('date', dateStr)
            .single();

          if (existingAction) {
            // Already assigned, skip
            continue;
          }

          // Generate action using same algorithm
          const action = await generateActionForDate(user.id, dateStr, categoryScores, adminSupabase);
          if (action) {
            assignedCount++;
          }
        }

        console.log(`Assigned ${assignedCount} actions for 7-day challenge`);
      } catch (assignError) {
        // Don't fail challenge join if action assignment fails
        console.error('Error assigning actions for challenge:', assignError);
      }
    }

    // Get user email for sending challenge email
    const { data: userWithEmail } = await supabase
      .from('users')
      .select('id, email, name, username')
      .eq('id', user.id)
      .single();

    // Check if this is their first challenge (for badge)
    const { data: allChallenges } = await supabase
      .from('user_challenges')
      .select('id')
      .eq('user_id', user.id);

    if (allChallenges && allChallenges.length === 1) {
      // First challenge - award "Challenge Starter" badge
      const { data: badge } = await supabase
        .from('badges')
        .select('id')
        .eq('name', 'Challenge Starter')
        .single();

      if (badge) {
        await supabase.from('user_badges').insert({
          user_id: user.id,
          badge_id: badge.id,
          earned_at: new Date().toISOString(),
        });
      }
    }

    // Send email with all challenge actions (all challenges are 7-day challenges)
    if (challenge && userWithEmail && userChallenge) {
      try {
        // Get all challenge actions for the email
        const { data: challengeActionsData } = await supabase
          .from('challenge_actions')
          .select(`
            day_number,
            actions (
              id,
              name,
              description
            )
          `)
          .eq('challenge_id', challengeId)
          .order('day_number', { ascending: true });

        const challengeActions = challengeActionsData || [];
        
        // Only send email if we have challenge actions
        if (challengeActions.length > 0) {
          await sendChallengeEmail(userWithEmail, challenge, challengeActions, userChallenge);
        }
      } catch (emailError) {
        // Don't fail challenge join if email fails
        console.error('Error sending challenge email:', emailError);
      }
    }

    return NextResponse.json({ success: true, userChallenge });
  } catch (error) {
    console.error('Unexpected error joining challenge:', error);
    return NextResponse.json({ error: 'Unexpected error' }, { status: 500 });
  }
}

async function generateActionForDate(
  userId: string,
  dateStr: string,
  categoryScores: any,
  adminSupabase: any,
): Promise<any> {
  // Get actions user hasn't seen in the last 30 days
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const thirtyDaysAgoStr = thirtyDaysAgo.toISOString().split('T')[0];

  const { data: recentActions } = await adminSupabase
    .from('user_daily_actions')
    .select('action_id')
    .eq('user_id', userId)
    .gte('date', thirtyDaysAgoStr);

  const seenActionIds = recentActions?.map((ra: any) => ra.action_id) || [];

  // Get available actions
  let { data: actions } = await adminSupabase
    .from('actions')
    .select('*')
    .limit(100);

  // Filter out actions seen in last 30 days
  if (actions && seenActionIds.length > 0) {
    actions = actions.filter((action: any) => !seenActionIds.includes(action.id));
  }

  // Personalize action selection based on survey results
  if (actions && categoryScores && actions.length > 0) {
    const categoryMapping: Record<string, string> = {
      'communication': 'Communication',
      'romance': 'Romance',
      'partnership': 'Partnership',
      'intimacy': 'Intimacy',
      'conflict': 'Communication',
      'connection': 'Roommate Syndrome Recovery',
    };

    const connectionScore = categoryScores.connection_score || categoryScores.intimacy_score || 50;

    const scores = [
      { category: 'communication', score: categoryScores.communication_score || 50 },
      { category: 'romance', score: categoryScores.romance_score || 50 },
      { category: 'partnership', score: categoryScores.partnership_score || 50 },
      { category: 'intimacy', score: categoryScores.intimacy_score || 50 },
      { category: 'conflict', score: categoryScores.conflict_score || 50 },
      { category: 'connection', score: connectionScore },
    ];

    scores.sort((a, b) => a.score - b.score);
    const lowestCategory = scores[0];
    const targetCategory = categoryMapping[lowestCategory.category];

    const priorityActions = actions.filter((a: any) => a.category === targetCategory);
    if (priorityActions.length > 0) {
      // 70% chance to pick from priority category, 30% random
      if (Math.random() < 0.7) {
        actions = priorityActions;
      }
    }
  }

  if (!actions || actions.length === 0) {
    // Fallback: get any action
    const { data: allActions } = await adminSupabase
      .from('actions')
      .select('*')
      .limit(100);

    if (!allActions || allActions.length === 0) {
      return null;
    }
    actions = allActions;
  }

  const randomAction = actions[Math.floor(Math.random() * actions.length)];

  // Save to user_daily_actions (this ensures algorithm respects pre-assigned actions)
  await adminSupabase.from('user_daily_actions').insert({
    user_id: userId,
    action_id: randomAction.id,
    date: dateStr,
  });

  return randomAction;
}

async function sendChallengeEmail(
  user: any,
  challenge: any,
  challengeActions: any[],
  userChallenge: any
) {
  const challengeName = challenge.name;
  const joinedDate = userChallenge?.joined_date || new Date().toISOString().split('T')[0];
  try {
    const { Resend } = await import('resend');
    // Initialize Resend - will be validated before use
    const resend = new Resend(process.env.RESEND_API_KEY || '');

    if (!resend || !process.env.RESEND_API_KEY) {
      console.log('Resend not configured, skipping challenge email');
      return;
    }

    const displayName = user.username || (user.name ? user.name.split(' ')[0] : 'there');
    const baseUrl = process.env.AUTH0_BASE_URL || 'https://besthusbandever.com';

    // Generate calendar links
    const firstDate = new Date(joinedDate);
    firstDate.setHours(9, 0, 0);
    const startDateStr = firstDate.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    const endDate = new Date(firstDate);
    endDate.setHours(endDate.getHours() + 1);
    const endDateStr = endDate.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    
    const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(challengeName)}&dates=${startDateStr}/${endDateStr}&details=${encodeURIComponent('7 days of personalized relationship actions')}`;
    const outlookCalendarUrl = `https://outlook.live.com/calendar/0/deeplink/compose?subject=${encodeURIComponent(challengeName)}&startdt=${firstDate.toISOString()}&enddt=${endDate.toISOString()}&body=${encodeURIComponent('7 days of personalized relationship actions')}`;

    const { data, error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'Best Husband Ever - Tomorrow\'s Action! <action@besthusbandever.com>',
      to: user.email,
      subject: `🎯 Boom. Challenge Started. 7 Days to Level Up.`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5;">
            <div style="background-color: #0f172a; padding: 30px; border-radius: 8px; margin-bottom: 20px;">
              <h1 style="color: #fbbf24; margin: 0; font-size: 24px;">Best Husband Ever</h1>
              <p style="color: #cbd5e1; margin: 5px 0 0 0; font-size: 14px;">Your daily mission, delivered.</p>
            </div>
            
            <div style="background-color: #ffffff; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              <div style="text-align: center; margin-bottom: 25px;">
                <div style="font-size: 48px; margin-bottom: 15px;">🎯</div>
                <h2 style="color: #1e293b; margin-top: 0; font-size: 24px;">Boom. You&apos;re In.</h2>
                <p style="color: #64748b; font-size: 18px; margin: 10px 0; font-weight: 600;">
                  7 days. 7 chances to level up. Your wife notices in 3... 2... 1...
                </p>
                <p style="color: #94a3b8; font-size: 14px; margin: 5px 0 0 0;">
                  Welcome to <strong style="color: #fbbf24;">${challengeName}</strong>
                </p>
              </div>
              
              <div style="background-color: #f8fafc; border-left: 4px solid #fbbf24; padding: 20px; margin: 20px 0; border-radius: 4px;">
                <p style="color: #475569; font-size: 15px; margin: 0 0 10px 0;">
                  <strong style="color: #1e293b;">Hey ${displayName},</strong>
                </p>
                <p style="color: #475569; font-size: 15px; margin: 0 0 15px 0;">
                  Here&apos;s the deal: We&apos;ve locked in <strong style="color: #fbbf24;">7 personalized actions</strong>, one for each day. These aren&apos;t random—they&apos;re tailored to you based on your survey. These actions will appear on your dashboard each day and take priority over the algorithm.
                </p>
                <p style="color: #475569; font-size: 15px; margin: 0;">
                  Your complete 7-day action plan (aka your roadmap to winning):
                </p>
              </div>
              
              ${challengeActions.length > 0 ? `
                <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin: 20px 0;">
                  <h3 style="color: #1e293b; font-size: 18px; margin: 0 0 15px 0; font-weight: 600;">Your 7-Day Action Plan</h3>
                  ${challengeActions.map((ca: any, index: number) => {
                    const action = ca.actions;
                    const eventDate = new Date(joinedDate);
                    eventDate.setDate(new Date(joinedDate).getDate() + (ca.day_number - 1));
                    const dateStr = eventDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
                    
                    return `
                      <div style="background-color: #ffffff; border-left: 3px solid #fbbf24; padding: 15px; margin-bottom: 12px; border-radius: 4px;">
                        <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 8px;">
                          <span style="background-color: #fbbf24; color: #0f172a; font-size: 12px; font-weight: 700; padding: 4px 10px; border-radius: 12px;">
                            Day ${ca.day_number}
                          </span>
                          <span style="color: #64748b; font-size: 12px; font-weight: 500;">
                            ${dateStr}
                          </span>
                        </div>
                        <h4 style="color: #1e293b; font-size: 16px; font-weight: 600; margin: 8px 0; line-height: 1.4;">
                          ${action?.name || 'Action'}
                        </h4>
                        ${action?.description ? `
                          <p style="color: #475569; font-size: 14px; margin: 0; line-height: 1.5;">
                            ${action.description}
                          </p>
                        ` : ''}
                      </div>
                    `;
                  }).join('')}
                </div>
              ` : ''}
              
              <div style="background-color: #fef3c7; border-left: 4px solid #fbbf24; padding: 15px; margin: 20px 0; border-radius: 4px;">
                <p style="margin: 0; color: #92400e; font-size: 13px; font-weight: 600;">💡 Want to be extra smart?</p>
                <p style="margin: 5px 0 0 0; color: #78350f; font-size: 14px;">
                  Add these to your calendar now. Planning ahead = actually doing it. No excuses, no forgetting, just execution. Pre-assigned actions take priority over the daily algorithm, so you&apos;re locked and loaded.
                </p>
              </div>
              
              <div style="margin-top: 25px;">
                <p style="color: #64748b; font-size: 14px; margin: 0 0 15px 0; text-align: center; font-weight: 600;">
                  Add to Your Calendar:
                </p>
                <div style="display: flex; flex-direction: column; gap: 10px;">
                  <a href="${googleCalendarUrl}" 
                     target="_blank"
                     style="display: inline-block; background-color: #4285f4; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600; text-align: center; font-size: 14px;">
                    📅 Add to Google Calendar
                  </a>
                  
                  <a href="${outlookCalendarUrl}" 
                     target="_blank"
                     style="display: inline-block; background-color: #0078d4; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600; text-align: center; font-size: 14px;">
                    📅 Add to Outlook Calendar
                  </a>
                  
                  <a href="${baseUrl}/api/calendar/actions/download?days=7&userId=${user.id}" 
                     style="display: inline-block; background-color: #0f172a; color: #fbbf24; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600; text-align: center; border: 2px solid #fbbf24; font-size: 14px;">
                    📥 Download iCal File (Apple Calendar)
                  </a>
                  
                  <a href="${baseUrl}/dashboard" 
                     style="display: inline-block; background-color: #fbbf24; color: #0f172a; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600; text-align: center; margin-top: 10px; font-size: 14px;">
                    View Challenge in Dashboard →
                  </a>
                </div>
              </div>
              
              <p style="color: #94a3b8; font-size: 13px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0;">
                These actions have been personalized based on your relationship survey. Complete them daily to make the most of your challenge!
              </p>
            </div>
            
            <div style="text-align: center; margin-top: 20px; color: #94a3b8; font-size: 12px;">
              <p>You&apos;re getting this because you joined a 7-day challenge on Best Husband Ever. Let&apos;s do this.</p>
              <p><a href="${baseUrl}/dashboard/account" style="color: #64748b;">Manage email preferences</a></p>
            </div>
          </body>
        </html>
      `,
    });

    if (error) {
      console.error('Resend error sending challenge email:', error);
    } else {
      console.log(`Challenge email sent to ${user.email}`);
    }
  } catch (error) {
    console.error('Error sending challenge email:', error);
  }
}

