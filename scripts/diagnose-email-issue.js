/**
 * Script to diagnose why emails didn't send today
 * Checks cron job execution, email service status, and user eligibility
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

async function diagnoseEmailIssue() {
  console.log('='.repeat(70));
  console.log('EMAIL DIAGNOSTIC REPORT');
  console.log('='.repeat(70));
  
  const emails = [
    'waterloo1983hawk22@gmail.com',
    'keepitgreen@live.ca'
  ];

  const now = new Date();
  console.log(`\nCurrent UTC time: ${now.toISOString()}`);
  console.log(`Current date: ${now.toISOString().split('T')[0]}\n`);

  for (const email of emails) {
    console.log('\n' + '='.repeat(70));
    console.log(`DIAGNOSING: ${email}`);
    console.log('='.repeat(70));

    // Get user
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, email, name, timezone, subscription_tier, email_preferences, work_days, created_at')
      .eq('email', email)
      .single();

    if (userError || !user) {
      console.log(`❌ User not found: ${email}`);
      continue;
    }

    const timezone = user.timezone || 'America/New_York';
    const tier = user.subscription_tier || 'free';
    
    // Calculate when email should have been sent today
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    
    // Get 6am in user's timezone for today
    const emailTime = new Date(today.toLocaleString('en-US', { timeZone: timezone }));
    emailTime.setHours(6, 0, 0, 0);
    
    // Convert back to UTC
    const emailTimeUTC = new Date(emailTime.toLocaleString('en-US', { timeZone: 'UTC' }));
    
    console.log(`\n📧 Email Schedule:`);
    console.log(`   User timezone: ${timezone}`);
    console.log(`   Email should send at: 6:00 AM ${timezone}`);
    console.log(`   That's: ${emailTimeUTC.toISOString()} UTC`);
    console.log(`   Has that time passed? ${now > emailTimeUTC ? '✅ YES' : '❌ NO (future)'}`);
    
    // Check if today is a work day
    const dayFormatter = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      weekday: 'long',
    });
    const weekdayName = dayFormatter.format(today);
    const weekdayMap = {
      'Sunday': 0, 'Monday': 1, 'Tuesday': 2, 'Wednesday': 3,
      'Thursday': 4, 'Friday': 5, 'Saturday': 6
    };
    const dayOfWeek = weekdayMap[weekdayName] ?? today.getDay();
    
    const workDays = user.work_days || [1, 2, 3, 4, 5];
    const isWorkDay = workDays.includes(dayOfWeek);
    
    console.log(`\n📅 Day Check:`);
    console.log(`   Today is: ${weekdayName} (day ${dayOfWeek})`);
    console.log(`   User's work days: ${workDays.join(', ')}`);
    console.log(`   Is today a work day? ${isWorkDay ? '✅ YES' : '❌ NO'}`);
    
    if (tier === 'free' && !isWorkDay) {
      console.log(`   ⚠️  Free users only get emails on work days`);
    }
    
    // Check email preferences
    const prefs = user.email_preferences || {};
    const dailyActionsEnabled = prefs.daily_actions !== false;
    console.log(`\n📧 Email Preferences:`);
    console.log(`   daily_actions enabled: ${dailyActionsEnabled ? '✅ YES' : '❌ NO'}`);
    
    // Check if user has today's action
    const todayStr = today.toISOString().split('T')[0];
    const { data: todayAction } = await supabase
      .from('user_daily_actions')
      .select('*, actions(*)')
      .eq('user_id', user.id)
      .eq('date', todayStr)
      .single();
    
    console.log(`\n📋 Action Status:`);
    if (todayAction) {
      console.log(`   ✅ User has today's action: ${todayAction.actions?.name || 'Unknown'}`);
      console.log(`   Action ID: ${todayAction.action_id}`);
      console.log(`   Created at: ${todayAction.created_at}`);
    } else {
      console.log(`   ⚠️  User does NOT have today's action assigned`);
    }
    
    // Summary
    console.log(`\n${'='.repeat(70)}`);
    console.log(`DIAGNOSIS FOR ${email.toUpperCase()}:`);
    console.log('='.repeat(70));
    
    // Premium users only get emails on work days (per cron logic)
    const shouldHaveReceived = 
      dailyActionsEnabled &&
      isWorkDay && // Both free and premium only get emails on work days
      now > emailTimeUTC;
    
    if (shouldHaveReceived) {
      console.log(`\n✅ User SHOULD HAVE received email today`);
      console.log(`\nPossible reasons it didn't send:`);
      console.log(`  1. ❓ Cron job didn't run at ${emailTimeUTC.toISOString()}`);
      console.log(`  2. ❓ Cron job ran but encountered an error`);
      console.log(`  3. ❓ Email service (Resend) had an issue`);
      console.log(`  4. ❓ Email was sent but went to spam`);
      console.log(`  5. ❓ Email was sent but user didn't see it`);
    } else {
      console.log(`\n⚠️  User should NOT receive email today because:`);
      if (!dailyActionsEnabled) {
        console.log(`  - Email preferences disabled`);
      }
      if (!isWorkDay) {
        console.log(`  - Today (${weekdayName}) is not a work day`);
        console.log(`  - Premium users only get emails on work days: ${workDays.map(d => ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][d]).join(', ')}`);
      }
      if (now <= emailTimeUTC) {
        console.log(`  - Email time hasn't arrived yet (${emailTimeUTC.toISOString()})`);
      }
    }
  }

  console.log(`\n${'='.repeat(70)}`);
  console.log('NEXT STEPS:');
  console.log('='.repeat(70));
  console.log(`1. Check Vercel cron job logs for /api/cron/send-tomorrow-tips`);
  console.log(`2. Check Resend dashboard for email delivery status`);
  console.log(`3. Verify CRON_SECRET is set in Vercel environment variables`);
  console.log(`4. Verify RESEND_API_KEY is set and valid`);
  console.log(`5. Test the cron endpoint manually to see if it works`);
  console.log(`\nTo test manually, run:`);
  console.log(`  curl -X GET "${process.env.AUTH0_BASE_URL || 'https://besthusbandever.com'}/api/cron/send-tomorrow-tips?secret=${process.env.CRON_SECRET || 'YOUR_SECRET'}"`);
}

diagnoseEmailIssue().catch(console.error);

