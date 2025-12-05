/**
 * Completely remove a user and all traces of them from the database
 * 
 * Usage:
 *   node scripts/delete-user-completely.js <email|auth0_id|user_id>
 * 
 * Example:
 *   node scripts/delete-user-completely.js user@example.com
 *   node scripts/delete-user-completely.js auth0|123456789
 *   node scripts/delete-user-completely.js 550e8400-e29b-41d4-a716-446655440000
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials. Make sure .env.local has:');
  console.error('  NEXT_PUBLIC_SUPABASE_URL');
  console.error('  SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function findUser(identifier) {
  // Try to find by username first (most common)
  let { data: user, error } = await supabase
    .from('users')
    .select('id, email, auth0_id, name, username')
    .eq('username', identifier)
    .single();

  if (!user && !error) {
    // Try by email
    ({ data: user, error } = await supabase
      .from('users')
      .select('id, email, auth0_id, name, username')
      .eq('email', identifier)
      .single());
  }

  if (!user && !error) {
    // Try by username (case-insensitive partial match)
    ({ data: user, error } = await supabase
      .from('users')
      .select('id, email, auth0_id, name, username')
      .ilike('username', `%${identifier}%`)
      .limit(1)
      .single());
  }

  if (!user && !error) {
    // Try by email (case-insensitive partial match)
    ({ data: user, error } = await supabase
      .from('users')
      .select('id, email, auth0_id, name, username')
      .ilike('email', `%${identifier}%`)
      .limit(1)
      .single());
  }

  if (!user && !error) {
    // Try by auth0_id
    ({ data: user, error } = await supabase
      .from('users')
      .select('id, email, auth0_id, name, username')
      .eq('auth0_id', identifier)
      .single());
  }

  if (!user && !error) {
    // Try by user_id (UUID)
    ({ data: user, error } = await supabase
      .from('users')
      .select('id, email, auth0_id, name, username')
      .eq('id', identifier)
      .single());
  }

  if (error || !user) {
    return null;
  }

  return user;
}

async function deleteUserCompletely(userId) {
  console.log(`\n🗑️  Starting complete user deletion for user ID: ${userId}\n`);

  const deletionResults = {
    user_tips: 0,
    user_action_completions: 0,
    user_badges: 0,
    user_challenges: 0,
    reflections: 0,
    deep_thoughts: 0,
    deep_thoughts_comments: 0,
    survey_responses: 0,
    survey_summary: 0,
    user_hidden_actions: 0,
    user_daily_actions: 0,
    email_replies: 0,
    user_category_preferences: 0,
    user_follow_up_surveys: 0,
    feedback: 0,
    guide_visits: 0,
    referrals_as_referrer: 0,
    referrals_as_referee: 0,
    stripe_subscriptions: 0,
    stripe_payment_methods: 0,
    users: 0,
  };

  try {
    // 1. Delete deep_thoughts_comments (comments on Team Wins posts)
    const { data: deepThoughts } = await supabase
      .from('deep_thoughts')
      .select('id')
      .eq('user_id', userId);

    if (deepThoughts && deepThoughts.length > 0) {
      const deepThoughtIds = deepThoughts.map(dt => dt.id);
      const { count: commentsCount } = await supabase
        .from('deep_thoughts_comments')
        .delete()
        .in('deep_thought_id', deepThoughtIds);
      deletionResults.deep_thoughts_comments = commentsCount || 0;
      console.log(`   ✓ Deleted ${deletionResults.deep_thoughts_comments} deep_thoughts_comments`);
    }

    // 2. Delete deep_thoughts (Team Wins posts)
    const { count: deepThoughtsCount } = await supabase
      .from('deep_thoughts')
      .delete()
      .eq('user_id', userId);
    deletionResults.deep_thoughts = deepThoughtsCount || 0;
    console.log(`   ✓ Deleted ${deletionResults.deep_thoughts} deep_thoughts (Team Wins posts)`);

    // 3. Delete reflections (journal entries)
    // Note: This will cascade delete any linked action completions via journal_entry_id
    const { count: reflectionsCount } = await supabase
      .from('reflections')
      .delete()
      .eq('user_id', userId);
    deletionResults.reflections = reflectionsCount || 0;
    console.log(`   ✓ Deleted ${deletionResults.reflections} reflections (journal entries)`);

    // 4. Delete user_action_completions (any remaining, not linked to reflections)
    const { count: actionCompletionsCount } = await supabase
      .from('user_action_completions')
      .delete()
      .eq('user_id', userId);
    deletionResults.user_action_completions = actionCompletionsCount || 0;
    console.log(`   ✓ Deleted ${deletionResults.user_action_completions} user_action_completions`);

    // 5. Delete user_badges
    const { count: badgesCount } = await supabase
      .from('user_badges')
      .delete()
      .eq('user_id', userId);
    deletionResults.user_badges = badgesCount || 0;
    console.log(`   ✓ Deleted ${deletionResults.user_badges} user_badges`);

    // 6. Delete user_challenges (7-day events)
    const { count: challengesCount } = await supabase
      .from('user_challenges')
      .delete()
      .eq('user_id', userId);
    deletionResults.user_challenges = challengesCount || 0;
    console.log(`   ✓ Deleted ${deletionResults.user_challenges} user_challenges (7-day events)`);

    // 7. Delete user_tips
    const { count: tipsCount } = await supabase
      .from('user_tips')
      .delete()
      .eq('user_id', userId);
    deletionResults.user_tips = tipsCount || 0;
    console.log(`   ✓ Deleted ${deletionResults.user_tips} user_tips`);

    // 8. Delete user_daily_actions
    const { count: dailyActionsCount } = await supabase
      .from('user_daily_actions')
      .delete()
      .eq('user_id', userId);
    deletionResults.user_daily_actions = dailyActionsCount || 0;
    console.log(`   ✓ Deleted ${deletionResults.user_daily_actions} user_daily_actions`);

    // 9. Delete user_hidden_actions
    const { count: hiddenActionsCount } = await supabase
      .from('user_hidden_actions')
      .delete()
      .eq('user_id', userId);
    deletionResults.user_hidden_actions = hiddenActionsCount || 0;
    console.log(`   ✓ Deleted ${deletionResults.user_hidden_actions} user_hidden_actions`);

    // 10. Delete survey_responses
    const { count: surveyResponsesCount } = await supabase
      .from('survey_responses')
      .delete()
      .eq('user_id', userId);
    deletionResults.survey_responses = surveyResponsesCount || 0;
    console.log(`   ✓ Deleted ${deletionResults.survey_responses} survey_responses`);

    // 11. Delete survey_summary
    const { count: surveySummaryCount } = await supabase
      .from('survey_summary')
      .delete()
      .eq('user_id', userId);
    deletionResults.survey_summary = surveySummaryCount || 0;
    console.log(`   ✓ Deleted ${deletionResults.survey_summary} survey_summary`);

    // 12. Delete email_replies (if table exists)
    try {
      const { count: emailRepliesCount } = await supabase
        .from('email_replies')
        .delete()
        .eq('user_id', userId);
      deletionResults.email_replies = emailRepliesCount || 0;
      if (emailRepliesCount > 0) {
        console.log(`   ✓ Deleted ${deletionResults.email_replies} email_replies`);
      }
    } catch (error) {
      // Table might not exist, ignore
      console.log(`   ⚠ email_replies table not found or error (skipping)`);
    }

    // 13. Delete user_category_preferences
    try {
      const { count: categoryPrefsCount } = await supabase
        .from('user_category_preferences')
        .delete()
        .eq('user_id', userId);
      deletionResults.user_category_preferences = categoryPrefsCount || 0;
      if (categoryPrefsCount > 0) {
        console.log(`   ✓ Deleted ${deletionResults.user_category_preferences} user_category_preferences`);
      }
    } catch (error) {
      console.log(`   ⚠ user_category_preferences table not found or error (skipping)`);
    }

    // 14. Delete user_follow_up_surveys
    try {
      const { count: followUpSurveysCount } = await supabase
        .from('user_follow_up_surveys')
        .delete()
        .eq('user_id', userId);
      deletionResults.user_follow_up_surveys = followUpSurveysCount || 0;
      if (followUpSurveysCount > 0) {
        console.log(`   ✓ Deleted ${deletionResults.user_follow_up_surveys} user_follow_up_surveys`);
      }
    } catch (error) {
      console.log(`   ⚠ user_follow_up_surveys table not found or error (skipping)`);
    }

    // 15. Delete feedback
    try {
      const { count: feedbackCount } = await supabase
        .from('feedback')
        .delete()
        .eq('user_id', userId);
      deletionResults.feedback = feedbackCount || 0;
      if (feedbackCount > 0) {
        console.log(`   ✓ Deleted ${deletionResults.feedback} feedback entries`);
      }
    } catch (error) {
      console.log(`   ⚠ feedback table not found or error (skipping)`);
    }

    // 16. Delete guide_visits
    try {
      const { count: guideVisitsCount } = await supabase
        .from('guide_visits')
        .delete()
        .eq('user_id', userId);
      deletionResults.guide_visits = guideVisitsCount || 0;
      if (guideVisitsCount > 0) {
        console.log(`   ✓ Deleted ${deletionResults.guide_visits} guide_visits`);
      }
    } catch (error) {
      console.log(`   ⚠ guide_visits table not found or error (skipping)`);
    }

    // 17. Delete referrals where user is the referrer
    try {
      const { count: referralsAsReferrerCount } = await supabase
        .from('referrals')
        .delete()
        .eq('referrer_id', userId);
      deletionResults.referrals_as_referrer = referralsAsReferrerCount || 0;
      if (referralsAsReferrerCount > 0) {
        console.log(`   ✓ Deleted ${deletionResults.referrals_as_referrer} referrals (as referrer)`);
      }
    } catch (error) {
      console.log(`   ⚠ referrals table not found or error (skipping)`);
    }

    // 18. Delete referrals where user is the referee
    try {
      const { count: referralsAsRefereeCount } = await supabase
        .from('referrals')
        .delete()
        .eq('referee_id', userId);
      deletionResults.referrals_as_referee = referralsAsRefereeCount || 0;
      if (referralsAsRefereeCount > 0) {
        console.log(`   ✓ Deleted ${deletionResults.referrals_as_referee} referrals (as referee)`);
      }
    } catch (error) {
      // Already handled above
    }

    // 19. Delete stripe_subscriptions
    try {
      const { count: subscriptionsCount } = await supabase
        .from('stripe_subscriptions')
        .delete()
        .eq('user_id', userId);
      deletionResults.stripe_subscriptions = subscriptionsCount || 0;
      if (subscriptionsCount > 0) {
        console.log(`   ✓ Deleted ${deletionResults.stripe_subscriptions} stripe_subscriptions`);
      }
    } catch (error) {
      console.log(`   ⚠ stripe_subscriptions table not found or error (skipping)`);
    }

    // 20. Delete stripe_payment_methods
    try {
      const { count: paymentMethodsCount } = await supabase
        .from('stripe_payment_methods')
        .delete()
        .eq('user_id', userId);
      deletionResults.stripe_payment_methods = paymentMethodsCount || 0;
      if (paymentMethodsCount > 0) {
        console.log(`   ✓ Deleted ${deletionResults.stripe_payment_methods} stripe_payment_methods`);
      }
    } catch (error) {
      console.log(`   ⚠ stripe_payment_methods table not found or error (skipping)`);
    }

    // 21. Update users table to clear referred_by_user_id (if this user was a referrer)
    try {
      await supabase
        .from('users')
        .update({ referred_by_user_id: null })
        .eq('referred_by_user_id', userId);
      console.log(`   ✓ Cleared referred_by_user_id references`);
    } catch (error) {
      // Ignore if column doesn't exist
    }

    // 22. Finally, delete the user record itself
    const { count: userCount } = await supabase
      .from('users')
      .delete()
      .eq('id', userId);
    deletionResults.users = userCount || 0;
    console.log(`   ✓ Deleted ${deletionResults.users} user record`);

    // Summary
    const totalDeleted = Object.values(deletionResults).reduce((sum, count) => sum + count, 0);

    console.log(`\n✅ User deletion complete!`);
    console.log(`\n📊 Summary:`);
    console.log(`   Total records deleted: ${totalDeleted}`);
    console.log(`\n📋 Breakdown:`);
    Object.entries(deletionResults).forEach(([table, count]) => {
      if (count > 0) {
        console.log(`   ${table}: ${count}`);
      }
    });

    return { success: true, deletionResults };
  } catch (error) {
    console.error('\n❌ Error during user deletion:', error);
    return { success: false, error: error.message, deletionResults };
  }
}

async function main() {
  const identifier = process.argv[2];

  if (!identifier) {
    console.error('❌ Please provide a user identifier (email, auth0_id, or user_id)');
    console.error('\nUsage:');
    console.error('  node scripts/delete-user-completely.js <email|auth0_id|user_id>');
    console.error('\nExamples:');
    console.error('  node scripts/delete-user-completely.js user@example.com');
    console.error('  node scripts/delete-user-completely.js auth0|123456789');
    console.error('  node scripts/delete-user-completely.js 550e8400-e29b-41d4-a716-446655440000');
    process.exit(1);
  }

  console.log(`\n🔍 Looking for user: ${identifier}\n`);

  const user = await findUser(identifier);

  if (!user) {
    console.error(`❌ User not found: ${identifier}`);
    console.error('\nPlease check:');
    console.error('  - Email address is correct');
    console.error('  - Auth0 ID is correct');
    console.error('  - User ID (UUID) is correct');
    process.exit(1);
  }

  console.log(`✅ Found user:`);
  console.log(`   ID: ${user.id}`);
  console.log(`   Email: ${user.email}`);
  console.log(`   Username: ${user.username || 'N/A'}`);
  console.log(`   Auth0 ID: ${user.auth0_id}`);
  console.log(`   Name: ${user.name || 'N/A'}`);

  // Confirm deletion
  console.log(`\n⚠️  WARNING: This will PERMANENTLY delete this user and ALL their data!`);
  console.log(`   This action cannot be undone.\n`);

  // In a real scenario, you might want to add a confirmation prompt here
  // For now, we'll proceed (you can add readline/prompt if needed)

  const result = await deleteUserCompletely(user.id);

  if (result.success) {
    console.log(`\n🎉 User ${user.email} has been completely removed from the system.`);
    process.exit(0);
  } else {
    console.error(`\n❌ Failed to completely delete user: ${result.error}`);
    process.exit(1);
  }
}

main();

