/**
 * Script to grant premium access to a user by email
 * 
 * Usage: node scripts/grant-premium-access-by-email.js user@example.com
 * 
 * This script uses the Supabase admin client to update a user's subscription tier
 */

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Error: Missing required environment variables');
  console.error('   Make sure .env.local contains:');
  console.error('   - NEXT_PUBLIC_SUPABASE_URL');
  console.error('   - SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const email = process.argv[2];

if (!email) {
  console.error('❌ Error: Email address required');
  console.error('   Usage: node scripts/grant-premium-access-by-email.js user@example.com');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function grantPremiumAccess() {
  try {
    console.log(`\n🔍 Looking up user with email: ${email}...`);

    // First, find the user
    const { data: user, error: findError } = await supabase
      .from('users')
      .select('id, email, name, subscription_tier, auth0_id')
      .eq('email', email)
      .single();

    if (findError || !user) {
      console.error('❌ Error: User not found');
      console.error('   Make sure the email address is correct and the user has signed up');
      process.exit(1);
    }

    console.log(`✅ Found user: ${user.name || user.email}`);
    console.log(`   Current tier: ${user.subscription_tier}`);
    console.log(`   Auth0 ID: ${user.auth0_id}`);

    if (user.subscription_tier === 'premium') {
      console.log('\n⚠️  User already has premium access');
      console.log('   No changes needed.');
      process.exit(0);
    }

    // Update to premium
    console.log('\n🔄 Granting premium access...');

    const { data: updatedUser, error: updateError } = await supabase
      .from('users')
      .update({
        subscription_tier: 'premium',
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id)
      .select('id, email, name, subscription_tier')
      .single();

    if (updateError) {
      console.error('❌ Error updating user:', updateError);
      process.exit(1);
    }

    console.log('\n✅ Success! Premium access granted');
    console.log(`   User: ${updatedUser.name || updatedUser.email}`);
    console.log(`   New tier: ${updatedUser.subscription_tier}`);
    console.log('\n💡 Note: This grants lifetime premium access (no Stripe subscription)');
    console.log('   The user will have access to all premium features immediately.\n');

  } catch (error) {
    console.error('❌ Unexpected error:', error);
    process.exit(1);
  }
}

grantPremiumAccess();

