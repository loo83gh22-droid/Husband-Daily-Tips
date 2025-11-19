# Resend Email Setup Checklist ✅

## Current Status

### ✅ DNS Records Status (from your screenshots)
- **DKIM**: ✅ Verified (TXT record for `resend._domainkey`)
- **SPF**: ⏳ Pending (TXT record for `send` - waiting for DNS propagation)
- **MX**: ⏳ Pending (MX record for `send` - waiting for DNS propagation)
- **DMARC**: ✅ Added (TXT record for `_dmarc`)

**Note**: DNS propagation can take a few minutes to several hours. Once SPF and MX records are verified, you're all set!

## Next Steps

### Step 1: Get Your Resend API Key

1. Go to [resend.com](https://resend.com) and sign in
2. Navigate to **API Keys** in the dashboard
3. Click **Create API Key**
4. Name it: `Best Husband Ever Production`
5. Copy the API key (starts with `re_`)

### Step 2: Get Your Verified Domain

Once DNS records are verified in Resend:
1. Go to **Domains** in Resend dashboard
2. Note your verified domain (e.g., `yourdomain.com`)
3. You'll use this as the "from" email: `tips@yourdomain.com`

### Step 3: Generate CRON_SECRET

Run this PowerShell command:
```powershell
-join ((48..57) + (97..102) | Get-Random -Count 64 | ForEach-Object {[char]$_})
```

Or use this online generator: https://randomkeygen.com/

Copy the generated secret.

### Step 4: Add Environment Variables

#### For Local Development (`.env.local`):

Add these lines:
```env
# Resend Email
RESEND_API_KEY=re_your_api_key_here
RESEND_FROM_EMAIL=Best Husband Ever <tips@yourdomain.com>
CRON_SECRET=your_generated_secret_here
```

**Replace:**
- `re_your_api_key_here` with your actual Resend API key
- `tips@yourdomain.com` with your verified domain email
- `your_generated_secret_here` with the CRON_SECRET you generated

#### For Vercel (Production):

1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add these three variables:
   - `RESEND_API_KEY` = your Resend API key
   - `RESEND_FROM_EMAIL` = `Best Husband Ever <tips@yourdomain.com>`
   - `CRON_SECRET` = your generated secret

**Important**: Make sure to set these for **Production**, **Preview**, and **Development** environments (or at least Production).

### Step 5: Verify Cron Job in Vercel

The cron job is already configured in `vercel.json`:
- **Path**: `/api/cron/send-tomorrow-tips`
- **Schedule**: `0 12 * * *` (12pm daily)

You should verify it's enabled:
1. Go to Vercel dashboard → Your Project → **Settings** → **Cron Jobs**
2. You should see the cron job listed
3. Make sure it's **enabled**

### Step 6: Test Email Sending

#### Test Locally:

You can test by making a manual request:
```bash
curl -X GET "http://localhost:3000/api/cron/send-tomorrow-tips?secret=YOUR_CRON_SECRET"
```

#### Test in Production:

After deploying:
```bash
curl -X GET "https://your-project.vercel.app/api/cron/send-tomorrow-tips" \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

Or manually trigger in Vercel:
1. Go to your project → **Functions** tab
2. Find `/api/cron/send-tomorrow-tips`
3. Click **Invoke** (if available)

### Step 7: Monitor Email Delivery

1. Check Resend dashboard → **Emails** tab
2. You'll see all sent emails with delivery status
3. Check for any bounces or failures

## Troubleshooting

### DNS Records Still Pending?

- Wait 15-30 minutes for DNS propagation
- Verify records are correctly added in Namecheap
- Check that record values match exactly what Resend shows
- Use a DNS checker tool: https://mxtoolbox.com/

### Emails Not Sending?

1. **Check Resend Dashboard**:
   - Go to **Emails** tab
   - Look for error messages
   - Check API key is correct

2. **Check Vercel Logs**:
   - Go to your project → **Logs** tab
   - Look for error messages in function logs

3. **Verify Environment Variables**:
   - Check `.env.local` for local testing
   - Check Vercel dashboard for production

4. **Verify Domain**:
   - Resend free tier only allows sending to verified email addresses
   - Make sure you've verified your domain in Resend
   - For testing, you can use `onboarding@resend.dev` temporarily

### Cron Job Not Running?

1. Check Vercel dashboard → **Cron Jobs** tab
2. Verify cron job is enabled
3. Check that `CRON_SECRET` matches in environment variables
4. Verify the schedule is correct: `0 12 * * *` (12pm daily)

## Email Template

The email template is in `lib/email.ts`. You can customize:
- Email subject
- HTML template styling
- Content and messaging
- Add unsubscribe links
- Personalize with user names

## Current Email Features

✅ Sends tomorrow's tip at 12pm today (Atomic Habits style)
✅ Beautiful HTML email template
✅ Includes tip category, title, and content
✅ Links back to dashboard
✅ Pre-assigns tips for tomorrow

## Rate Limits (Resend Free Tier)

- **3,000 emails/month**
- **100 emails/day**

If you exceed these limits, you'll need to upgrade your Resend plan.

## Next Steps After Setup

1. ✅ Test email sending works
2. ✅ Monitor first few emails for delivery
3. ✅ Customize email template if needed
4. ✅ Add unsubscribe functionality (optional)
5. ✅ Set up email preferences per user (optional)

