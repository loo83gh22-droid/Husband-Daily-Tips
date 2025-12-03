/**
 * Email Delivery Monitoring Script
 * 
 * Checks email delivery status via Resend API and provides a health report.
 * 
 * Usage:
 *   node scripts/monitor-email-delivery.js [--hours=24] [--detailed]
 * 
 * Options:
 *   --hours=N    Check emails from last N hours (default: 24)
 *   --detailed   Show detailed breakdown of each email
 */

require('dotenv').config({ path: '.env.local' });

const RESEND_API_KEY = process.env.RESEND_API_KEY;

if (!RESEND_API_KEY) {
  console.error('❌ Error: RESEND_API_KEY not found in environment variables');
  console.error('   Make sure .env.local exists and contains RESEND_API_KEY');
  process.exit(1);
}

// Parse command line arguments
const args = process.argv.slice(2);
const hoursArg = args.find(arg => arg.startsWith('--hours='));
const hours = hoursArg ? parseInt(hoursArg.split('=')[1]) : 24;
const detailed = args.includes('--detailed');

// Calculate date range
const now = new Date();
const startDate = new Date(now.getTime() - hours * 60 * 60 * 1000);

async function fetchEmails() {
  const url = `https://api.resend.com/emails?limit=100`;
  
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Resend API error: ${response.status} - ${error}`);
    }

    const data = await response.json();
    return data.data || [];
  } catch (error) {
    console.error('❌ Error fetching emails:', error.message);
    throw error;
  }
}

function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function getStatusIcon(status) {
  const icons = {
    'delivered': '✅',
    'delivery_delayed': '⏳',
    'complained': '⚠️',
    'bounced': '❌',
    'failed': '❌',
    'pending': '⏳',
    'sending': '📤',
    'rejected': '🚫',
  };
  return icons[status] || '❓';
}

function analyzeEmails(emails) {
  const filtered = emails.filter(email => {
    const emailDate = new Date(email.created_at);
    return emailDate >= startDate;
  });

  const stats = {
    total: filtered.length,
    delivered: 0,
    pending: 0,
    bounced: 0,
    failed: 0,
    complained: 0,
    rejected: 0,
    delayed: 0,
    other: 0,
    byStatus: {},
    recentFailures: [],
    bounceReasons: [],
  };

  filtered.forEach(email => {
    const status = email.last_event || 'unknown';
    stats.byStatus[status] = (stats.byStatus[status] || 0) + 1;

    switch (status) {
      case 'delivered':
        stats.delivered++;
        break;
      case 'pending':
      case 'sending':
        stats.pending++;
        break;
      case 'bounced':
        stats.bounced++;
        stats.bounceReasons.push({
          to: email.to?.[0] || 'unknown',
          reason: email.error || 'Unknown bounce reason',
          date: email.created_at,
        });
        break;
      case 'failed':
      case 'rejected':
        stats.failed++;
        stats.rejected++;
        stats.recentFailures.push({
          to: email.to?.[0] || 'unknown',
          subject: email.subject || 'No subject',
          error: email.error || 'Unknown error',
          date: email.created_at,
        });
        break;
      case 'complained':
        stats.complained++;
        break;
      case 'delivery_delayed':
        stats.delayed++;
        break;
      default:
        stats.other++;
    }
  });

  return { filtered, stats };
}

function calculateDeliveryRate(stats) {
  if (stats.total === 0) return 0;
  const successful = stats.delivered;
  const totalProcessed = stats.total - stats.pending;
  if (totalProcessed === 0) return 0;
  return ((successful / totalProcessed) * 100).toFixed(1);
}

function printReport(emails, stats) {
  console.log('\n' + '='.repeat(70));
  console.log('📧 EMAIL DELIVERY MONITORING REPORT');
  console.log('='.repeat(70));
  console.log(`📅 Time Period: Last ${hours} hours (since ${formatDate(startDate)})`);
  console.log(`🕐 Generated: ${formatDate(now.toISOString())}`);
  console.log('');

  if (stats.total === 0) {
    console.log('⚠️  No emails found in the specified time period.');
    console.log('   This could mean:');
    console.log('   - No emails were sent during this period');
    console.log('   - Cron job may not have run');
    console.log('   - Check Vercel logs for cron job execution');
    return;
  }

  // Overall Stats
  console.log('📊 OVERALL STATISTICS');
  console.log('-'.repeat(70));
  console.log(`Total Emails:        ${stats.total}`);
  console.log(`✅ Delivered:         ${stats.delivered} (${((stats.delivered / stats.total) * 100).toFixed(1)}%)`);
  console.log(`⏳ Pending/Sending:   ${stats.pending} (${((stats.pending / stats.total) * 100).toFixed(1)}%)`);
  console.log(`❌ Bounced:          ${stats.bounced} (${((stats.bounced / stats.total) * 100).toFixed(1)}%)`);
  console.log(`❌ Failed/Rejected:  ${stats.failed} (${((stats.failed / stats.total) * 100).toFixed(1)}%)`);
  console.log(`⚠️  Complained:       ${stats.complained} (${((stats.complained / stats.total) * 100).toFixed(1)}%)`);
  console.log(`⏳ Delayed:           ${stats.delayed} (${((stats.delayed / stats.total) * 100).toFixed(1)}%)`);
  console.log('');

  // Delivery Rate
  const deliveryRate = calculateDeliveryRate(stats);
  const deliveryRateNum = parseFloat(deliveryRate);
  
  console.log('🎯 DELIVERY RATE');
  console.log('-'.repeat(70));
  if (deliveryRateNum >= 95) {
    console.log(`✅ Excellent: ${deliveryRate}% (Target: ≥95%)`);
  } else if (deliveryRateNum >= 90) {
    console.log(`⚠️  Good: ${deliveryRate}% (Target: ≥95%)`);
  } else if (deliveryRateNum >= 80) {
    console.log(`⚠️  Fair: ${deliveryRate}% (Needs attention - Target: ≥95%)`);
  } else {
    console.log(`❌ Poor: ${deliveryRate}% (Critical - Target: ≥95%)`);
  }
  console.log('');

  // Status Breakdown
  if (Object.keys(stats.byStatus).length > 0) {
    console.log('📋 STATUS BREAKDOWN');
    console.log('-'.repeat(70));
    Object.entries(stats.byStatus)
      .sort((a, b) => b[1] - a[1])
      .forEach(([status, count]) => {
        const icon = getStatusIcon(status);
        const percentage = ((count / stats.total) * 100).toFixed(1);
        console.log(`  ${icon} ${status.padEnd(20)} ${count.toString().padStart(4)} (${percentage}%)`);
      });
    console.log('');
  }

  // Recent Failures
  if (stats.recentFailures.length > 0) {
    console.log('❌ RECENT FAILURES (Last 10)');
    console.log('-'.repeat(70));
    stats.recentFailures.slice(0, 10).forEach(failure => {
      console.log(`  To: ${failure.to}`);
      console.log(`  Subject: ${failure.subject}`);
      console.log(`  Error: ${failure.error}`);
      console.log(`  Date: ${formatDate(failure.date)}`);
      console.log('');
    });
  }

  // Bounce Reasons
  if (stats.bounceReasons.length > 0) {
    console.log('🚫 BOUNCE REASONS (Last 10)');
    console.log('-'.repeat(70));
    stats.bounceReasons.slice(0, 10).forEach(bounce => {
      console.log(`  To: ${bounce.to}`);
      console.log(`  Reason: ${bounce.reason}`);
      console.log(`  Date: ${formatDate(bounce.date)}`);
      console.log('');
    });
  }

  // Health Assessment
  console.log('🏥 HEALTH ASSESSMENT');
  console.log('-'.repeat(70));
  
  const issues = [];
  if (deliveryRateNum < 95) {
    issues.push(`Delivery rate below target (${deliveryRate}% < 95%)`);
  }
  if (stats.bounced > 0) {
    issues.push(`${stats.bounced} email(s) bounced`);
  }
  if (stats.failed > 0) {
    issues.push(`${stats.failed} email(s) failed/rejected`);
  }
  if (stats.complained > 0) {
    issues.push(`${stats.complained} spam complaint(s) - investigate immediately`);
  }
  if (stats.delayed > stats.total * 0.1) {
    issues.push(`High number of delayed emails (${stats.delayed})`);
  }

  if (issues.length === 0) {
    console.log('✅ All systems operational - No issues detected');
    console.log('');
    console.log('💡 DMARC Policy Status:');
    console.log('   Current: p=quarantine (monitoring phase)');
    console.log('   Recommendation: Monitor for 2-4 weeks, then move to p=reject');
  } else {
    console.log('⚠️  Issues detected:');
    issues.forEach(issue => console.log(`   - ${issue}`));
    console.log('');
    console.log('🔍 Next Steps:');
    if (stats.bounced > 0 || stats.failed > 0) {
      console.log('   1. Check bounce/failure reasons above');
      console.log('   2. Verify SPF, DKIM, and DMARC records are correct');
      console.log('   3. Check if recipient email addresses are valid');
    }
    if (stats.complained > 0) {
      console.log('   1. Review email content and frequency');
      console.log('   2. Ensure unsubscribe links are working');
      console.log('   3. Consider reducing email frequency');
    }
    if (deliveryRateNum < 90) {
      console.log('   1. Review DMARC policy - may need to adjust');
      console.log('   2. Check Resend dashboard for detailed logs');
      console.log('   3. Verify domain authentication (SPF, DKIM)');
    }
  }

  // Detailed View
  if (detailed && emails.length > 0) {
    console.log('\n📧 DETAILED EMAIL LIST (Last 20)');
    console.log('-'.repeat(70));
    emails
      .filter(email => {
        const emailDate = new Date(email.created_at);
        return emailDate >= startDate;
      })
      .slice(0, 20)
      .forEach(email => {
        const status = email.last_event || 'unknown';
        const icon = getStatusIcon(status);
        console.log(`\n${icon} ${email.subject || 'No subject'}`);
        console.log(`   To: ${email.to?.[0] || 'unknown'}`);
        console.log(`   Status: ${status}`);
        console.log(`   Date: ${formatDate(email.created_at)}`);
        if (email.error) {
          console.log(`   Error: ${email.error}`);
        }
      });
  }

  console.log('\n' + '='.repeat(70));
  console.log('💡 Tip: Run with --detailed flag to see individual email details');
  console.log('💡 Tip: Use --hours=N to check different time periods (e.g., --hours=48)');
  console.log('='.repeat(70) + '\n');
}

async function main() {
  try {
    console.log('🔍 Fetching email data from Resend...');
    const emails = await fetchEmails();
    
    const { filtered, stats } = analyzeEmails(emails);
    printReport(filtered, stats);

    // Exit with appropriate code
    const deliveryRate = parseFloat(calculateDeliveryRate(stats));
    if (deliveryRate < 90 || stats.bounced > stats.total * 0.05 || stats.complained > 0) {
      process.exit(1); // Exit with error if issues detected
    }
  } catch (error) {
    console.error('\n❌ Monitoring failed:', error.message);
    console.error('\nTroubleshooting:');
    console.error('  1. Verify RESEND_API_KEY is correct in .env.local');
    console.error('  2. Check your internet connection');
    console.error('  3. Verify Resend API is accessible');
    process.exit(1);
  }
}

main();

