/**
 * Script to upgrade a user to premium lifetime access
 * Usage: node scripts/upgrade-user-to-lifetime-premium.js <email>
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('Error: Missing required environment variables.');
  console.error('Please ensure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in .env.local');
  process.exit(1);
}

const adminSupabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function upgradeToLifetimePremium(email) {
  try {
    console.log(`\nLooking up user with email: ${email}...`);
    
    // First, find the user by email
    const { data: user, error: findError } = await adminSupabase
      .from('users')
      .select('id, email, name, subscription_tier, subscription_ends_at, stripe_subscription_id')
      .eq('email', email.toLowerCase().trim())
      .single();

    if (findError || !user) {
      console.error(`\n❌ Error: User not found with email ${email}`);
      console.error('Error details:', findError);
      process.exit(1);
    }

    console.log(`\n✅ Found user:`);
    console.log(`   ID: ${user.id}`);
    console.log(`   Name: ${user.name || 'N/A'}`);
    console.log(`   Current Tier: ${user.subscription_tier}`);
    console.log(`   Current Subscription Ends: ${user.subscription_ends_at || 'N/A'}`);
    console.log(`   Stripe Subscription ID: ${user.stripe_subscription_id || 'N/A'}`);

    // Update to premium lifetime access
    // For lifetime, we'll set subscription_ends_at to a far future date (100 years from now)
    const lifetimeDate = new Date();
    lifetimeDate.setFullYear(lifetimeDate.getFullYear() + 100);

    const { data: updatedUser, error: updateError } = await adminSupabase
      .from('users')
      .update({
        subscription_tier: 'premium',
        subscription_ends_at: lifetimeDate.toISOString(),
        subscription_status: 'active',
        stripe_subscription_id: 'lifetime', // Mark as lifetime (not a real Stripe subscription)
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id)
      .select()
      .single();

    if (updateError) {
      console.error(`\n❌ Error updating user:`, updateError);
      process.exit(1);
    }

    console.log(`\n✅ Successfully upgraded user to premium lifetime access!`);
    console.log(`\nUpdated user details:`);
    console.log(`   Subscription Tier: ${updatedUser.subscription_tier}`);
    console.log(`   Subscription Ends: ${updatedUser.subscription_ends_at}`);
    console.log(`   Subscription Status: ${updatedUser.subscription_status}`);
    console.log(`   Stripe Subscription ID: ${updatedUser.stripe_subscription_id}`);
    console.log(`\n✨ User now has premium lifetime access!`);

  } catch (error) {
    console.error('\n❌ Unexpected error:', error);
    process.exit(1);
  }
}

// Get email from command line arguments
const email = process.argv[2];

if (!email) {
  console.error('\n❌ Error: Email address required');
  console.error('Usage: node scripts/upgrade-user-to-lifetime-premium.js <email>');
  console.error('Example: node scripts/upgrade-user-to-lifetime-premium.js user@example.com');
  process.exit(1);
}

upgradeToLifetimePremium(email);

