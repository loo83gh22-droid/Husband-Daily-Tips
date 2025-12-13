/**
 * Script to check for duplicate users by email
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

async function checkDuplicateUsers(email) {
  try {
    console.log(`\nChecking for users with email: ${email}...\n`);
    
    const { data: users, error } = await adminSupabase
      .from('users')
      .select('id, email, name, auth0_id, subscription_tier, subscription_ends_at, stripe_subscription_id, created_at, updated_at')
      .eq('email', email.toLowerCase().trim())
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error querying users:', error);
      process.exit(1);
    }

    if (!users || users.length === 0) {
      console.log('No users found with that email.');
      return;
    }

    console.log(`Found ${users.length} user(s) with email ${email}:\n`);

    users.forEach((user, index) => {
      console.log(`User ${index + 1}:`);
      console.log(`  ID: ${user.id}`);
      console.log(`  Email: ${user.email}`);
      console.log(`  Name: ${user.name || 'N/A'}`);
      console.log(`  Auth0 ID: ${user.auth0_id || 'N/A'}`);
      console.log(`  Subscription Tier: ${user.subscription_tier}`);
      console.log(`  Subscription Ends: ${user.subscription_ends_at || 'N/A'}`);
      console.log(`  Stripe Subscription ID: ${user.stripe_subscription_id || 'N/A'}`);
      console.log(`  Created At: ${user.created_at}`);
      console.log(`  Updated At: ${user.updated_at}`);
      console.log('');
    });

    if (users.length > 1) {
      console.log('⚠️  WARNING: Multiple users found with the same email!');
      console.log('This could cause issues. Consider merging or deleting duplicates.\n');
    }

  } catch (error) {
    console.error('Unexpected error:', error);
    process.exit(1);
  }
}

const email = process.argv[2] || 'tonyevans.pgeo@gmail.com';
checkDuplicateUsers(email);

