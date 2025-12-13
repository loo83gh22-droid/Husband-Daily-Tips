/**
 * Script to compare data between two user accounts
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('Error: Missing required environment variables.');
  process.exit(1);
}

const adminSupabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function compareUserData(userId1, userId2) {
  try {
    console.log(`\nComparing data for two users...\n`);
    
    const tables = [
      { name: 'user_daily_actions', label: 'Daily Actions' },
      { name: 'user_action_completions', label: 'Action Completions' },
      { name: 'user_badges', label: 'Badges' },
      { name: 'user_challenges', label: 'Challenges' },
      { name: 'reflections', label: 'Reflections' },
      { name: 'deep_thoughts', label: 'Team Wins Posts' },
      { name: 'survey_summary', label: 'Survey Summary' },
      { name: 'user_category_preferences', label: 'Category Preferences' },
      { name: 'referrals', label: 'Referrals' },
    ];

    const results = {};

    for (const table of tables) {
      // Count for user 1
      const { count: count1 } = await adminSupabase
        .from(table.name)
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId1);

      // Count for user 2
      const { count: count2 } = await adminSupabase
        .from(table.name)
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId2);

      results[table.name] = {
        label: table.label,
        user1: count1 || 0,
        user2: count2 || 0,
      };
    }

    console.log('Data Comparison:');
    console.log('─'.repeat(60));
    console.log(`${'Table'.padEnd(30)} | User 1 | User 2`);
    console.log('─'.repeat(60));
    
    let total1 = 0;
    let total2 = 0;

    for (const [table, data] of Object.entries(results)) {
      console.log(`${data.label.padEnd(30)} | ${String(data.user1).padStart(6)} | ${String(data.user2).padStart(6)}`);
      total1 += data.user1;
      total2 += data.user2;
    }

    console.log('─'.repeat(60));
    console.log(`${'TOTAL'.padEnd(30)} | ${String(total1).padStart(6)} | ${String(total2).padStart(6)}`);
    console.log('─'.repeat(60));

    console.log(`\nRecommendation:`);
    if (total1 > total2) {
      console.log(`✅ Keep User 1 (has more data: ${total1} records vs ${total2})`);
      console.log(`❌ Delete User 2`);
    } else if (total2 > total1) {
      console.log(`✅ Keep User 2 (has more data: ${total2} records vs ${total1})`);
      console.log(`❌ Delete User 1`);
    } else {
      console.log(`⚠️  Both users have similar data. Keep the one with premium access (User 1).`);
    }

  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

const userId1 = process.argv[2] || '49bef020-20a3-4eaa-9312-1282e2393048';
const userId2 = process.argv[3] || '31a23539-9247-48e1-a41a-bec7c222d736';

compareUserData(userId1, userId2);

