# Email Reply Setup Guide - Professional Solution

## 🎯 Overview

This guide sets up **Resend Inbound Email** to automatically receive and process email replies to your daily action emails. This is the professional, long-term solution.

## ✅ What This Provides

- **Automatic Reply Capture**: Replies are automatically received and stored
- **Database Storage**: All replies stored in `email_replies` table
- **User Tracking**: Links replies to user accounts
- **Admin Notifications**: Optional notifications when replies are received
- **Scalable**: Handles any volume of replies
- **Professional**: Industry-standard solution

## 📋 Setup Steps

### Step 1: Enable Resend Inbound Email

1. **Go to Resend Dashboard**
   - Visit: https://resend.com/domains
   - Select your domain (`besthusbandever.com`)

2. **Enable Inbound Email**
   - Go to "Inbound" tab
   - Click "Enable Inbound Email"
   - Resend will provide you with:
     - MX records to add to your domain
     - Webhook secret

3. **Add MX Records to Your Domain**
   - Go to your domain registrar (e.g., Namecheap, GoDaddy)
   - Add the MX records Resend provides
   - Wait for DNS propagation (can take up to 24 hours, usually 1-2 hours)

### Step 2: Configure Webhook in Resend

1. **Set Webhook URL**
   - In Resend Dashboard → Domains → Your Domain → Inbound
   - Set Webhook URL: `https://www.besthusbandever.com/api/webhooks/resend-inbound`
   - Copy the Webhook Secret

2. **Add to Vercel Environment Variables**
   - Go to Vercel Dashboard → Your Project → Settings → Environment Variables
   - Add: `RESEND_INBOUND_WEBHOOK_SECRET` = (paste the secret from Resend)
   - Add: `NOTIFY_ADMIN_ON_REPLIES` = `true` (optional - sends you notifications)
   - Make sure `ADMIN_EMAIL` or `SUPPORT_EMAIL` is set (for notifications)

### Step 3: Run Database Migration

1. **Run the Migration**
   - Go to Supabase Dashboard → SQL Editor
   - Run: `supabase/migrations/080_create_email_replies_table.sql`
   - This creates the `email_replies` table

### Step 4: Deploy the Webhook Endpoint

The webhook endpoint is already created at:
- `app/api/webhooks/resend-inbound/route.ts`

Just commit and deploy:
```bash
git add app/api/webhooks/resend-inbound/route.ts
git add supabase/migrations/080_create_email_replies_table.sql
git commit -m "Add Resend Inbound Email webhook for handling email replies"
git push origin main
```

### Step 5: Test It

1. **Send a Test Reply**
   - Reply to one of your daily action emails
   - Check Supabase: `email_replies` table should have a new entry
   - Check Vercel logs: Should see webhook received

2. **Verify in Resend Dashboard**
   - Go to Resend → Domains → Your Domain → Inbound
   - Check "Recent Emails" - should show your test reply

## 📊 How It Works

```
User replies to email
    ↓
Resend receives email (via MX records)
    ↓
Resend sends webhook to your endpoint
    ↓
/api/webhooks/resend-inbound processes it
    ↓
Stores in email_replies table
    ↓
Optionally notifies admin
```

## 🗄️ Database Schema

The `email_replies` table stores:
- `user_id` - Links to user account (null if unknown)
- `from_email` - Email address of replier
- `from_name` - Name of replier
- `subject` - Email subject
- `content` - Email body (text or HTML)
- `status` - received, read, replied, archived, unknown_user
- `received_at` - When reply was received
- `read_at` - When you read it (manual update)
- `replied_at` - When you replied (manual update)
- `admin_notes` - Your notes about the reply

## 🔍 Viewing Replies

### Option 1: Supabase Dashboard
- Go to Supabase → Table Editor → `email_replies`
- View all replies, filter by user, status, etc.

### Option 2: Create Admin Interface (Future)
You can create a simple admin page to view and manage replies:
- `/dashboard/admin/email-replies` (protected route)
- List all replies
- Mark as read/replied
- Add notes
- Reply directly from interface

### Option 3: SQL Queries
```sql
-- View all unread replies
SELECT * FROM email_replies 
WHERE status = 'received' 
ORDER BY received_at DESC;

-- View replies from specific user
SELECT * FROM email_replies 
WHERE user_id = 'user-uuid-here'
ORDER BY received_at DESC;

-- View unknown user replies
SELECT * FROM email_replies 
WHERE status = 'unknown_user'
ORDER BY received_at DESC;
```

## 🔔 Admin Notifications

If `NOTIFY_ADMIN_ON_REPLIES=true`:
- You'll receive an email notification when replies are received
- Sent to `ADMIN_EMAIL` or `SUPPORT_EMAIL`
- Includes user info and reply content

**To enable**: Set `NOTIFY_ADMIN_ON_REPLIES=true` in Vercel

**To disable**: Set `NOTIFY_ADMIN_ON_REPLIES=false` or remove the variable

## 🛡️ Security

- **Webhook Signature Verification**: Verifies requests are from Resend
- **RLS Policies**: Users can only see their own replies
- **Service Role**: Webhook uses service role (bypasses RLS for inserts)

## 📝 Next Steps (Optional Enhancements)

### 1. Create Admin Interface
- Build `/dashboard/admin/email-replies` page
- View, filter, and manage replies
- Mark as read/replied
- Add notes

### 2. Auto-Reply Feature
- Send automatic acknowledgment: "Thanks for your reply! We'll get back to you soon."
- Can be added to webhook handler

### 3. Email Threading
- Link replies to original daily action
- Track conversation history
- Add `original_action_id` field

### 4. Integration with Support System
- Connect to Zendesk, Intercom, etc.
- Forward replies to support system
- Sync status updates

## 🐛 Troubleshooting

### Replies Not Being Received

1. **Check MX Records**
   - Verify MX records are added correctly
   - Wait for DNS propagation (up to 24 hours)
   - Use DNS checker: https://mxtoolbox.com/

2. **Check Resend Dashboard**
   - Go to Resend → Domains → Inbound
   - Check "Recent Emails" - are emails being received?
   - Check webhook logs - are webhooks being sent?

3. **Check Vercel Logs**
   - Go to Vercel Dashboard → Your Project → Logs
   - Look for webhook requests
   - Check for errors

4. **Check Database**
   - Verify `email_replies` table exists
   - Check if records are being inserted
   - Check for errors in Supabase logs

### Webhook Not Working

1. **Verify Webhook URL**
   - Should be: `https://www.besthusbandever.com/api/webhooks/resend-inbound`
   - Test it manually (should return JSON)

2. **Check Environment Variables**
   - `RESEND_INBOUND_WEBHOOK_SECRET` is set
   - `ADMIN_EMAIL` or `SUPPORT_EMAIL` is set (for notifications)

3. **Check Vercel Deployment**
   - Make sure latest code is deployed
   - Check deployment logs for errors

## 💰 Cost

- **Resend Inbound**: Free tier includes inbound email
- **Database Storage**: Minimal (text storage is cheap)
- **No Additional Costs**: Uses existing infrastructure

## ✅ Checklist

- [ ] Enable Resend Inbound Email in Resend Dashboard
- [ ] Add MX records to domain
- [ ] Wait for DNS propagation
- [ ] Set webhook URL in Resend
- [ ] Add `RESEND_INBOUND_WEBHOOK_SECRET` to Vercel
- [ ] Run database migration (080_create_email_replies_table.sql)
- [ ] Deploy webhook endpoint
- [ ] Test by replying to an email
- [ ] Verify reply appears in database
- [ ] (Optional) Set up admin notifications

---

**This is the professional, scalable solution. Once set up, it handles all email replies automatically!** 🚀

