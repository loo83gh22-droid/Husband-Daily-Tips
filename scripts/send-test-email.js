/**
 * Script to send a test email to a user by username
 * 
 * Usage: node scripts/send-test-email.js Thommer22
 * 
 * Make sure to set environment variables:
 * - RESEND_API_KEY
 * - CRON_SECRET (optional, defaults to 'dev-secret' for local)
 * - SUPABASE_SERVICE_ROLE_KEY
 * - NEXT_PUBLIC_SUPABASE_URL
 */

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const { Resend } = require('resend');

const username = process.argv[2] || 'Thommer22';

if (!username) {
  console.error('❌ Username required');
  console.log('Usage: node scripts/send-test-email.js <username>');
  process.exit(1);
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const resendApiKey = process.env.RESEND_API_KEY;
const cronSecret = process.env.CRON_SECRET || 'dev-secret';
const baseUrl = process.env.AUTH0_BASE_URL || 'http://localhost:3000';

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials');
  console.log('Make sure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in .env.local');
  process.exit(1);
}

if (!resendApiKey) {
  console.error('❌ Missing RESEND_API_KEY');
  console.log('Make sure RESEND_API_KEY is set in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

const resend = new Resend(resendApiKey);

async function sendTestEmail() {
  try {
    console.log(`🔍 Looking for user with username: "${username}"...`);
    
    // Find user by username
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, email, name, username, timezone, subscription_tier')
      .eq('username', username)
      .single();

    if (userError || !user) {
      console.error(`❌ User not found: ${userError?.message || 'No user found'}`);
      console.log(`\nTrying to find user by email instead...`);
      
      // Try finding by email if username doesn't work
      const { data: users } = await supabase
        .from('users')
        .select('id, email, name, username')
        .limit(10);
      
      if (users && users.length > 0) {
        console.log('\n📋 Available users:');
        users.forEach(u => {
          console.log(`  - Username: ${u.username || '(none)'}, Email: ${u.email}, Name: ${u.name || '(none)'}`);
        });
      }
      process.exit(1);
    }

    console.log(`✅ Found user:`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Name: ${user.name || '(none)'}`);
    console.log(`   Username: ${user.username || '(none)'}`);
    console.log(`   ID: ${user.id}`);

    // Get a random action for the test
    const { data: actions } = await supabase
      .from('actions')
      .select('*')
      .limit(1);

    const action = actions && actions.length > 0 
      ? actions[0] 
      : {
          name: 'Test Action',
          description: 'This is a test email to verify the email service is working correctly.',
          icon: '📧',
          category: 'Test',
          benefit: 'Testing email delivery from action@besthusbandever.com'
        };

    const displayName = user.username || (user.name ? user.name.split(' ')[0] : 'there');

    console.log(`\n📧 Sending test email to ${user.email}...`);

    // Send test email
    const { data: emailData, error: emailError } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'Best Husband Ever - Tomorrow\'s Action! <action@besthusbandever.com>',
      to: user.email,
      subject: `Test Email: Tomorrow's Action`,
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
              <div style="background-color: #fef3c7; border-left: 4px solid #fbbf24; padding: 15px; margin-bottom: 20px; border-radius: 4px;">
                <p style="margin: 0; color: #92400e; font-size: 14px; font-weight: 600;">🧪 TEST EMAIL</p>
                <p style="margin: 5px 0 0 0; color: #78350f; font-size: 13px;">This is a test email to verify the email service is working correctly.</p>
              </div>
              
              <h2 style="color: #1e293b; margin-top: 0;">Hi ${displayName},</h2>
              
              <p style="color: #475569; font-size: 16px;">Here's your action for tomorrow:</p>
              
              <div style="background-color: #f8fafc; border-left: 4px solid #fbbf24; padding: 20px; margin: 20px 0; border-radius: 4px;">
                <p style="margin: 0 0 10px 0; font-size: 18px; font-weight: 600; color: #1e293b;">
                  ${action.icon ? `${action.icon} ` : ''}${action.name}
                </p>
                <p style="margin: 10px 0 0 0; color: #64748b; font-size: 15px;">
                  ${action.description}
                </p>
                ${action.benefit ? `
                  <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid #e2e8f0;">
                    <p style="margin: 0 0 5px 0; font-size: 13px; font-weight: 600; color: #fbbf24; text-transform: uppercase;">Why this matters:</p>
                    <p style="margin: 0; color: #475569; font-size: 14px;">${action.benefit}</p>
                  </div>
                ` : ''}
              </div>
              
              <div style="margin-top: 25px; display: flex; flex-direction: column; gap: 10px;">
                <a href="${baseUrl}/dashboard" 
                   style="display: inline-block; background-color: #fbbf24; color: #0f172a; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600; text-align: center;">
                  View in Dashboard →
                </a>
                
                <div style="display: flex; gap: 10px; flex-wrap: wrap; justify-content: center; margin-top: 10px;">
                  <a href="${baseUrl}/api/calendar/actions/download?days=1&userId=${user.id}" 
                     style="display: inline-block; background-color: #0f172a; color: #fbbf24; padding: 10px 20px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 14px; border: 2px solid #fbbf24;">
                    📅 Download Tomorrow's Action
                  </a>
                  <a href="${baseUrl}/api/calendar/actions/download?days=7&userId=${user.id}" 
                     style="display: inline-block; background-color: #0f172a; color: #fbbf24; padding: 10px 20px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 14px; border: 2px solid #fbbf24;">
                    📅 Download 7 Days of Actions
                  </a>
                </div>
              </div>
              
              <p style="color: #94a3b8; font-size: 13px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0;">
                Completing this action boosts your relationship health bar. Consistency is what moves the needle.
              </p>
              <p style="color: #64748b; font-size: 12px; margin-top: 10px;">
                <strong>Tip:</strong> Download actions to your calendar to plan ahead and lock in your commitment! Pre-assigned actions take precedence over the daily algorithm.
              </p>
            </div>
            
            <div style="text-align: center; margin-top: 20px; color: #94a3b8; font-size: 12px;">
              <p>You're receiving this test email because it was manually triggered.</p>
              <p><a href="${baseUrl}/dashboard/account" style="color: #64748b;">Manage email preferences</a></p>
            </div>
          </body>
        </html>
      `,
    });

    if (emailError) {
      console.error('❌ Error sending email:', emailError);
      process.exit(1);
    }

    console.log(`\n✅ Test email sent successfully!`);
    console.log(`   Email ID: ${emailData?.id}`);
    console.log(`   Sent to: ${user.email}`);
    console.log(`   From: ${process.env.RESEND_FROM_EMAIL || 'Best Husband Ever - Tomorrow\'s Action! <action@besthusbandever.com>'}`);
    console.log(`\n📬 Check the inbox for ${user.email} (and spam folder if needed)`);

  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
    if (process.env.NODE_ENV === 'development') {
      console.error(error.stack);
    }
    process.exit(1);
  }
}

sendTestEmail();

