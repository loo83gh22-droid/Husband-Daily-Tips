# Email Reply Forwarding Setup

## ✅ What Was Changed

### 1. Updated Reply-To Address
**File:** `lib/email.ts`

- **Before:** `replyTo: process.env.SUPPORT_EMAIL || process.env.ADMIN_EMAIL || 'support@besthusbandever.com'`
- **After:** `replyTo: 'action@besthusbandever.com'`

**Result:** When users reply to emails, they will see they're replying to `action@besthusbandever.com` (not your admin email).

### 2. Added Direct Email Forwarding
**File:** `app/api/webhooks/resend-inbound/route.ts`

- Added automatic forwarding of reply emails directly to your admin email
- You'll now receive:
  1. A formatted notification email (existing feature)
  2. A forwarded copy of the actual reply email (new feature)

## 🔧 How It Works

1. **Email sent to user:**
   - From: `action@besthusbandever.com`
   - Reply-To: `action@besthusbandever.com`

2. **User replies:**
   - User sees they're replying to: `action@besthusbandever.com` ✅
   - Email goes to: `action@besthusbandever.com`

3. **Resend receives the reply:**
   - Resend catches emails sent to `action@besthusbandever.com`
   - Resend forwards the email to your webhook: `/api/webhooks/resend-inbound`

4. **Webhook processes the reply:**
   - Stores reply in database (`email_replies` table)
   - Sends formatted notification to admin
   - Forwards actual email to admin (waterloo1983hawk22@gmail.com)

## ✅ What You Need to Verify

### 1. Resend Inbound Email Setup
Make sure Resend Inbound is configured to receive emails at `action@besthusbandever.com`:

1. Go to Resend Dashboard → Domains → `besthusbandever.com` → **Inbound** tab
2. Verify that:
   - ✅ Inbound Email is **Enabled**
   - ✅ MX records are properly configured
   - ✅ Webhook URL is set: `https://www.besthusbandever.com/api/webhooks/resend-inbound`

### 2. MX Records (If Not Already Set)
Resend Inbound requires MX records in your DNS:

- **Type:** MX
- **Name/Host:** `@` (or blank/root)
- **Value/Target:** `feedback-smtp.resend.com` (or whatever Resend shows you)
- **Priority:** `10` (or whatever Resend shows you)

### 3. Environment Variables
Make sure these are set in Vercel:

- `ADMIN_EMAIL` = `waterloo1983hawk22@gmail.com` (your admin email)
- `RESEND_API_KEY` = (your Resend API key)
- `RESEND_INBOUND_WEBHOOK_SECRET` = (webhook secret from Resend)

## 🧪 How to Test

1. **Send yourself a test email** (if you have access to trigger the daily email)
2. **Reply to the email** from your user account
3. **Check your admin email** (waterloo1983hawk22@gmail.com):
   - You should receive 2 emails:
     - A formatted notification with user info
     - A forwarded copy of the actual reply

## 📝 Notes

- Replies are stored in the `email_replies` table in Supabase
- You can disable the notification emails by setting `NOTIFY_ADMIN_ON_REPLIES=false` in environment variables
- The forwarded email has a `replyTo` set to the user's email, so you can reply directly from your admin email

## 🔍 Troubleshooting

**If replies aren't being received:**

1. **Check Resend Dashboard:**
   - Go to Resend → Domains → Your Domain → Inbound
   - Check webhook logs to see if emails are being received

2. **Check DNS MX Records:**
   - Use `dig MX besthusbandever.com` or online MX record checker
   - Verify MX records point to Resend

3. **Check Vercel Logs:**
   - Go to Vercel Dashboard → Your Project → Functions
   - Look for logs from `/api/webhooks/resend-inbound`

4. **Test webhook manually:**
   - Use Resend's webhook testing feature in the dashboard

---

**Status:** ✅ Code changes complete. Verify Resend Inbound setup and test!
