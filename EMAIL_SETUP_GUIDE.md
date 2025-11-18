# Email Setup Guide - Resend Integration

This guide will help you set up daily email notifications using Resend (Atomic Habits style - sending tomorrow's tip at 12pm today).

## Step 1: Create Resend Account

1. Go to [resend.com](https://resend.com)
2. Sign up for a free account
3. Verify your email address

## Step 2: Get API Key

1. In Resend dashboard, go to **API Keys**
2. Click **Create API Key**
3. Name it "Husband Daily Tips Production"
4. Copy the API key (starts with `re_`)

## Step 3: Verify Domain (Optional but Recommended)

For production, you should verify your domain:

1. Go to **Domains** in Resend dashboard
2. Click **Add Domain**
3. Enter your domain (e.g., `yourdomain.com`)
4. Add the DNS records Resend provides to your domain registrar
5. Wait for verification (usually a few minutes)

**For testing**, you can use Resend's default domain, but emails will show "on behalf of" Resend.

## Step 4: Install Resend Package

In your project folder, run:

```bash
npm install resend
```

## Step 5: Update Environment Variables

Add to your `.env.local` (and Vercel environment variables):

```env
RESEND_API_KEY=re_your_api_key_here
CRON_SECRET=your-random-secret-here
```

Generate a random secret for CRON_SECRET:
```bash
openssl rand -hex 32
```

## Step 6: Update Email Code

1. Open `lib/email.ts`
2. Uncomment all the code (remove the `/* */` comments)
3. Update the `from` email address:
   - If you verified a domain: `Husband Daily Tips <tips@yourdomain.com>`
   - For testing: `Husband Daily Tips <onboarding@resend.dev>`

## Step 7: Configure Vercel Cron

### Option A: Using Vercel Dashboard (Recommended)

1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Cron Jobs**
3. Click **Add Cron Job**
4. Configure:
   - **Path**: `/api/cron/send-tomorrow-tips`
   - **Schedule**: `0 12 * * *` (12pm daily)
   - **Timezone**: Your timezone (e.g., `America/New_York`)
5. Add environment variable:
   - **CRON_SECRET**: The random secret you generated

### Option B: Using vercel.json (Already Configured)

The `vercel.json` file already has the cron job configured. Just make sure:
- `CRON_SECRET` is set in Vercel environment variables
- The cron job is enabled in Vercel dashboard

## Step 8: Test Email Sending

### Manual Test

1. Create a test API route or use a tool like Postman
2. Make a GET request to: `https://your-domain.vercel.app/api/cron/send-tomorrow-tips`
3. Add header: `Authorization: Bearer YOUR_CRON_SECRET`
4. Check your email inbox

### Test Locally

You can test the email function directly:

```typescript
import { sendTomorrowTipEmail } from '@/lib/email';

await sendTomorrowTipEmail(
  'your-email@example.com',
  'Your Name',
  {
    title: 'Test Tip',
    content: 'This is a test tip to verify email sending works.',
    category: 'Communication',
  }
);
```

## Step 9: Monitor Email Delivery

1. Go to Resend dashboard → **Emails**
2. You'll see all sent emails with delivery status
3. Check for any bounces or failures

## Troubleshooting

### Emails Not Sending

1. Check Resend dashboard for error messages
2. Verify API key is correct in environment variables
3. Check that domain is verified (if using custom domain)
4. Look at Vercel function logs for errors

### Cron Job Not Running

1. Verify cron job is enabled in Vercel dashboard
2. Check that `CRON_SECRET` matches in both places
3. Verify the schedule is correct (`0 12 * * *` = 12pm daily)
4. Check Vercel function logs for cron execution

### Rate Limits

Resend free tier includes:
- 3,000 emails/month
- 100 emails/day

If you exceed limits, upgrade your Resend plan or implement rate limiting.

## Email Template Customization

The email template is in `lib/email.ts`. You can customize:
- Colors and styling
- Content and messaging
- Add unsubscribe links
- Add user personalization

## Next Steps

- Set up unsubscribe functionality
- Add email preferences (daily, weekly, etc.)
- A/B test different email formats
- Track open rates and engagement

## Alternative: SendGrid

If you prefer SendGrid:

1. Install: `npm install @sendgrid/mail`
2. Get API key from SendGrid dashboard
3. Update `lib/email.ts` to use SendGrid instead
4. SendGrid also supports scheduled sends

