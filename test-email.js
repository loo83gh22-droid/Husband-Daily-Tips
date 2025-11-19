/**
 * Test script for email service
 * Run with: node test-email.js
 * 
 * Make sure you have:
 * 1. RESEND_API_KEY in .env.local
 * 2. Your dev server is NOT running (or use Method 2 instead)
 */

require('dotenv').config({ path: '.env.local' });

async function testEmail() {
  // Check if environment variables are set
  if (!process.env.RESEND_API_KEY) {
    console.error('❌ RESEND_API_KEY not found in .env.local');
    console.log('\nPlease add to .env.local:');
    console.log('RESEND_API_KEY=re_your_api_key_here');
    console.log('\nThen restart this script.');
    process.exit(1);
  }

  console.log('✅ RESEND_API_KEY found');
  console.log('📧 Testing email service...\n');

  // Import the email function (using dynamic import for ES modules)
  const emailModule = await import('./lib/email.js');
  const { sendTomorrowTipEmail } = emailModule;

  // Get test email from environment or use a default
  const testEmail = process.env.TEST_EMAIL || process.env.AUTH0_BASE_URL?.includes('localhost') 
    ? 'test@example.com' 
    : 'your-email@example.com';
  
  if (!testEmail || testEmail === 'your-email@example.com' || testEmail === 'test@example.com') {
    console.log('⚠️  No TEST_EMAIL set. Please add to .env.local:');
    console.log('   TEST_EMAIL=your-actual-email@example.com\n');
    console.log('For now, using a placeholder. The email will fail, but you can see the error.');
  }

  console.log(`Sending test email to: ${testEmail}\n`);

  const success = await sendTomorrowTipEmail(
    testEmail,
    'Test User',
    {
      title: 'Test Tip - Email Service Working!',
      content: 'This is a test email to verify the email service is working correctly.\n\nIf you received this, the email service is set up properly!',
      category: 'Communication'
    }
  );

  if (success) {
    console.log('✅ Email sent successfully!');
    console.log(`📬 Check your inbox: ${testEmail}`);
    console.log('\nIf you don\'t see it:');
    console.log('  - Check spam/junk folder');
    console.log('  - Check Resend dashboard → Emails for delivery status');
    console.log('  - Wait a few seconds (emails can take 10-30 seconds)');
  } else {
    console.log('❌ Email failed to send');
    console.log('Check the error messages above for details');
    console.log('\nCommon issues:');
    console.log('  - Invalid RESEND_API_KEY');
    console.log('  - Invalid email address');
    console.log('  - Resend account not verified');
  }
}

testEmail().catch((error) => {
  console.error('❌ Error running test:', error.message);
  if (error.message.includes('Cannot find module')) {
    console.log('\n💡 Tip: Make sure your dev server is stopped, or use Method 2 (API endpoint) instead.');
  }
  process.exit(1);
});

