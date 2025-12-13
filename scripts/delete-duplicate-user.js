/**
 * Script to delete a duplicate user account
 * WARNING: This will permanently delete the user and all associated data
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

async function deleteUser(userId) {
  try {
    console.log(`\nFetching user details...\n`);
    
    // First, get user details
    const { data: user, error: findError } = await adminSupabase
      .from('users')
      .select('id, email, name, auth0_id, subscription_tier, created_at')
      .eq('id', userId)
      .single();

    if (findError || !user) {
      console.error(`❌ Error: User not found with ID ${userId}`);
      console.error('Error details:', findError);
      process.exit(1);
    }

    console.log(`User to delete:`);
    console.log(`  ID: ${user.id}`);
    console.log(`  Email: ${user.email}`);
    console.log(`  Name: ${user.name || 'N/A'}`);
    console.log(`  Auth0 ID: ${user.auth0_id}`);
    console.log(`  Subscription Tier: ${user.subscription_tier}`);
    console.log(`  Created At: ${user.created_at}`);
    console.log(`\n⚠️  WARNING: This will permanently delete this user and ALL associated data!`);
    console.log(`   This action cannot be undone.\n`);

    // Delete the user (cascade will handle related data)
    const { error: deleteError } = await adminSupabase
      .from('users')
      .delete()
      .eq('id', userId);

    if (deleteError) {
      console.error(`❌ Error deleting user:`, deleteError);
      process.exit(1);
    }

    console.log(`✅ Successfully deleted user ${user.email} (${user.id})`);
    console.log(`   All associated data has been removed.\n`);

  } catch (error) {
    console.error('Unexpected error:', error);
    process.exit(1);
  }
}

const userId = process.argv[2];

if (!userId) {
  console.error('\n❌ Error: User ID required');
  console.error('Usage: node scripts/delete-duplicate-user.js <user_id>');
  console.error('Example: node scripts/delete-duplicate-user.js 31a23539-9247-48e1-a41a-bec7c222d736');
  process.exit(1);
}

deleteUser(userId);

