# Email Service Setup - Step by Step

## ✅ Step 1: Resend Package Installed
**Status**: ✅ DONE - `resend` package is now installed

---

## 📝 Step 2: Create Resend Account

1. Go to [resend.com](https://resend.com)
2. Click **"Sign Up"** (or **"Get Started"**)
3. Sign up with your email
4. Verify your email address

---

## 🔑 Step 3: Get Your API Key

1. Once logged in, go to **"API Keys"** in the left sidebar
2. Click **"Create API Key"**
3. Name it: `Husband Daily Tips Production`
4. Click **"Add"**
5. **Copy the API key** (starts with `re_`) - you'll need this in the next step
   - ⚠️ **Important**: Copy it now! You won't be able to see it again

---

## 🔐 Step 4: Generate CRON Secret

**Already Generated!** Your CRON_SECRET is:
```
08f1a63aad04279af8722f158d22d12cb8440e42949be73acde14726d2bf5345
```

**Or generate a new one** by running this command in your terminal:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## ⚙️ Step 5: Add Environment Variables

### For Local Development (.env.local)

1. Open your `.env.local` file (in the project root)
2. Add these two lines:

```env
RESEND_API_KEY=re_your_api_key_here
CRON_SECRET=your_generated_secret_here
RESEND_FROM_EMAIL=Husband Daily Tips <onboarding@resend.dev>
```

**Replace:**
- `re_your_api_key_here` with the API key you copied from Resend
- `your_generated_secret_here` with the secret you generated in Step 4
- The `RESEND_FROM_EMAIL` is optional - defaults to `onboarding@resend.dev` for testing

### For Production (Vercel)

1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add these three variables:
   - `RESEND_API_KEY` = your Resend API key
   - `CRON_SECRET` = your generated secret
   - `RESEND_FROM_EMAIL` = `Husband Daily Tips <onboarding@resend.dev>` (or your verified domain email)

---

## ✅ Step 6: Code is Ready!

The email code has been uncommented and is ready to use. No code changes needed!

---

## 🧪 Step 7: Test Email Sending

### Option A: Test Locally (Recommended First)

1. Create a test file `test-email.js` in your project root:

```javascript
require('dotenv').config({ path: '.env.local' });
const { sendTomorrowTipEmail } = require('./lib/email.ts');

async function test() {
  const success = await sendTomorrowTipEmail(
    'your-email@example.com', // Replace with your email
    'Test User',
    {
      title: 'Test Tip',
      content: 'This is a test email to verify the email service is working correctly.',
      category: 'Communication'
    }
  );
  
  console.log('Email sent:', success);
}

test();
```

2. Or test via the API route (after starting your dev server):

```bash
npm run dev
```

Then in another terminal:
```bash
curl -X GET "http://localhost:3000/api/cron/send-tomorrow-tips" \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

### Option B: Test in Production

1. Deploy to Vercel
2. Make a GET request to: `https://your-domain.vercel.app/api/cron/send-tomorrow-tips`
3. Add header: `Authorization: Bearer YOUR_CRON_SECRET`
4. Check your email inbox

---

## ⏰ Step 8: Enable Cron Job in Vercel

The cron job is already configured in `vercel.json`, but you need to enable it:

1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Cron Jobs**
3. You should see the cron job: `/api/cron/send-tomorrow-tips`
4. Make sure it's **enabled**
5. Verify the schedule: `0 12 * * *` (12pm daily)
6. Set your timezone (e.g., `America/New_York`)

**Note**: The cron job will only run in production (not in local dev)

---

## 📧 Step 9: Verify Domain (Optional but Recommended)

For production, you should verify your domain:

1. In Resend dashboard, go to **"Domains"**
2. Click **"Add Domain"**
3. Enter your domain (e.g., `yourdomain.com`)
4. Add the DNS records Resend provides to your domain registrar
5. Wait for verification (usually a few minutes)
6. Once verified, update `RESEND_FROM_EMAIL` to: `Husband Daily Tips <tips@yourdomain.com>`

**For testing**, you can use the default `onboarding@resend.dev` - emails will work but show "on behalf of" Resend.

---

## ✅ Step 10: Monitor Email Delivery

1. Go to Resend dashboard → **"Emails"**
2. You'll see all sent emails with delivery status
3. Check for any bounces or failures

---

## 🎉 Done!

Your email service is now set up! The cron job will:
- Run daily at 12pm
- Send tomorrow's tip preview to all users
- Pre-assign tips in the database

---

## 🐛 Troubleshooting

### Emails Not Sending

1. **Check Resend dashboard** for error messages
2. **Verify API key** is correct in environment variables
3. **Check domain verification** (if using custom domain)
4. **Look at Vercel function logs** for errors

### Cron Job Not Running

1. **Verify cron job is enabled** in Vercel dashboard
2. **Check CRON_SECRET matches** in both places
3. **Verify schedule** is correct (`0 12 * * *` = 12pm daily)
4. **Check Vercel function logs** for cron execution

### Rate Limits

Resend free tier includes:
- 3,000 emails/month
- 100 emails/day

If you exceed limits, upgrade your Resend plan.

---

## 📝 Next Steps

- Test the email sending
- Monitor the first few emails
- Consider verifying your domain for production
- Add unsubscribe functionality (future enhancement)

