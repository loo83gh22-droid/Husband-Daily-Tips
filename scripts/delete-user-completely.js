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
  // Try to find by email
  let { data: user, error } = await supabase
    .from('users')
    .select('id, email, auth0_id, name')
    .eq('email', identifier)
    .single();

  if (!user && !error) {
    // Try by auth0_id
    ({ data: user, error } = await supabase
      .from('users')
      .select('id, email, auth0_id, name')
      .eq('auth0_id', identifier)
      .single());
  }

  if (!user && !error) {
    // Try by user_id (UUID)
    ({ data: user, error } = await supabase
      .from('users')
      .select('id, email, auth0_id, name')
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

    // 13. Finally, delete the user record itself
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

