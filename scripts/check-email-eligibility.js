/**
 * Script to check if specific users should have received action emails today
 * Usage: node scripts/check-email-eligibility.js
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkUserEmailEligibility(email) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`Checking: ${email}`);
  console.log('='.repeat(60));

  // Get user
  const { data: user, error: userError } = await supabase
    .from('users')
    .select('id, email, name, timezone, subscription_tier, email_preferences, created_at')
    .eq('email', email)
    .single();

  if (userError || !user) {
    console.log(`❌ User not found: ${email}`);
    return;
  }

  console.log(`✅ User found: ${user.name || user.email}`);
  console.log(`   User ID: ${user.id}`);
  console.log(`   Subscription: ${user.subscription_tier || 'free'}`);
  console.log(`   Timezone: ${user.timezone || 'America/New_York (default)'}`);
  console.log(`   Created: ${user.created_at}`);

  // Check email preferences
  const prefs = user.email_preferences || {};
  const dailyActionsEnabled = prefs.daily_actions !== false; // Defaults to true
  console.log(`\n📧 Email Preferences:`);
  console.log(`   daily_actions: ${prefs.daily_actions ?? 'true (default)'}`);
  console.log(`   Should receive emails: ${dailyActionsEnabled ? '✅ YES' : '❌ NO'}`);

  if (!dailyActionsEnabled) {
    console.log(`\n⚠️  User has disabled daily action emails`);
    return;
  }

  // Check timezone and current time
  const timezone = user.timezone || 'America/New_York';
  const now = new Date();
  
  try {
    const userTime = new Date(now.toLocaleString('en-US', { timeZone: timezone }));
    const hour = userTime.getHours();
    const minute = userTime.getMinutes();
    
    console.log(`\n🕐 Time Check:`);
    console.log(`   Current UTC time: ${now.toISOString()}`);
    console.log(`   User's local time: ${userTime.toLocaleString('en-US', { timeZone: timezone })}`);
    console.log(`   Hour in user's timezone: ${hour}:${minute.toString().padStart(2, '0')}`);
    
    // Check if it's around 6am (within 1 hour window)
    const is6amWindow = hour === 6 || (hour === 5 && minute >= 30) || (hour === 7 && minute <= 30);
    console.log(`   Is 6am window? ${is6amWindow ? '✅ YES' : '❌ NO'}`);
    
    if (!is6amWindow) {
      console.log(`\n⚠️  Not in 6am window. Emails are sent at 6am in user's timezone.`);
      console.log(`   Cron job runs every hour and checks if it's 6am for each user.`);
    }
  } catch (error) {
    console.log(`\n❌ Error checking timezone: ${error.message}`);
  }

  // Check subscription tier eligibility
  const tier = user.subscription_tier || 'free';
  console.log(`\n💳 Subscription Check:`);
  
  if (tier === 'free') {
    console.log(`   ⚠️  FREE tier: Users get 1 action per WEEK (not daily)`);
    console.log(`   Free users receive emails on the first day of their work week.`);
    
    // Check if today is their work week start
    const workDays = user.work_days || [1, 2, 3, 4, 5]; // Default Mon-Fri
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0 = Sunday, 1 = Monday, etc.
    
    // Check if today is in their work days
    const isWorkDay = workDays.includes(dayOfWeek);
    console.log(`   Today is day ${dayOfWeek} (0=Sun, 1=Mon, etc.)`);
    console.log(`   User's work days: ${workDays.join(', ')}`);
    console.log(`   Is today a work day? ${isWorkDay ? '✅ YES' : '❌ NO'}`);
    
    if (!isWorkDay) {
      console.log(`\n⚠️  Free users only receive emails on work days.`);
    }
  } else {
    console.log(`   ✅ ${tier.toUpperCase()} tier: Users get daily actions`);
  }

  // Check if user already has today's action
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];
  
  const { data: todayAction, error: actionError } = await supabase
    .from('user_daily_actions')
    .select('*, actions(*)')
    .eq('user_id', user.id)
    .eq('date', todayStr)
    .single();

  console.log(`\n📅 Today's Action Check:`);
  console.log(`   Date: ${todayStr}`);
  
  if (todayAction) {
    console.log(`   ✅ User has today's action: ${todayAction.actions?.name || 'Unknown'}`);
  } else {
    console.log(`   ⚠️  User does NOT have today's action assigned yet`);
  }

  // Check if user has tomorrow's action (which is what the email sends)
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split('T')[0];
  
  const { data: tomorrowAction, error: tomorrowError } = await supabase
    .from('user_daily_actions')
    .select('*, actions(*)')
    .eq('user_id', user.id)
    .eq('date', tomorrowStr)
    .single();

  console.log(`\n📧 Tomorrow's Action (Email Content):`);
  console.log(`   Date: ${tomorrowStr}`);
  
  if (tomorrowAction) {
    console.log(`   ✅ User has tomorrow's action: ${tomorrowAction.actions?.name || 'Unknown'}`);
    console.log(`   This is what would be sent in the email.`);
  } else {
    console.log(`   ⚠️  User does NOT have tomorrow's action assigned yet`);
    console.log(`   Email system would create one when sending.`);
  }

  // Summary
  console.log(`\n${'='.repeat(60)}`);
  console.log(`SUMMARY FOR ${email.toUpperCase()}:`);
  console.log('='.repeat(60));
  
  const shouldReceive = dailyActionsEnabled && 
    (tier !== 'free' || (tier === 'free' && isWorkDay));
  
  console.log(`Should receive email today? ${shouldReceive ? '✅ YES' : '❌ NO'}`);
  
  if (!shouldReceive) {
    console.log(`\nReasons:`);
    if (!dailyActionsEnabled) {
      console.log(`  - Email preferences disabled`);
    }
    if (tier === 'free' && !isWorkDay) {
      console.log(`  - Free tier only gets emails on work days`);
    }
  } else {
    console.log(`\n✅ User should receive email if:`);
    console.log(`  1. It's 6am in their timezone (${timezone})`);
    console.log(`  2. It's a work day (for free users) or their work day (for premium users)`);
    console.log(`  3. Cron job has run`);
    console.log(`  4. Email service is working`);
  }
}

async function main() {
  const emails = [
    'waterloo1983hawk22@gmail.com',
    'keepitgreen@live.ca'
  ];

  for (const email of emails) {
    await checkUserEmailEligibility(email);
  }

  console.log(`\n${'='.repeat(60)}`);
  console.log('Check complete!');
  console.log('='.repeat(60));
}

main().catch(console.error);

