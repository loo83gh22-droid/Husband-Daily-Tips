# Resend Inbound Email Setup - Step-by-Step Guide

Follow these steps **slowly and carefully**. Take your time with each step.

---

## 📋 Step 1: Go to Resend Dashboard

1. **Open your browser**
2. **Go to**: https://resend.com
3. **Log in** to your Resend account
4. **Click on "Domains"** in the left sidebar (or top navigation)

**What you should see**: A list of your domains (you should see `besthusbandever.com`)

**✅ Checkpoint**: You're logged into Resend and can see your domains.

---

## 📋 Step 2: Select Your Domain

1. **Click on** `besthusbandever.com` (or your domain name)
2. You should see tabs like: **Overview**, **DNS Records**, **Inbound**, **Webhooks**

**✅ Checkpoint**: You're on your domain's page and can see the "Inbound" tab.

---

## 📋 Step 3: Enable Inbound Email

1. **Click on the "Inbound" tab**
2. **Look for a button** that says "Enable Inbound Email" or "Set Up Inbound"
3. **Click that button**

**What will happen**:
- Resend will show you **MX records** (these are special DNS records)
- You'll see something like:
  ```
  Type: MX
  Name: @
  Value: feedback-smtp.resend.com
  Priority: 10
  ```

**✅ Checkpoint**: You can see the MX records that Resend wants you to add.

---

## 📋 Step 4: Copy the MX Records

1. **Write down or copy** the MX records Resend shows you
2. You'll need:
   - **Type**: MX
   - **Name**: Usually `@` or blank
   - **Value**: Something like `feedback-smtp.resend.com`
   - **Priority**: Usually `10` or `20`

**Important**: Copy these EXACTLY as shown. Don't change anything.

**✅ Checkpoint**: You have the MX records written down or copied.

---

## 📋 Step 5: Go to Your Domain Registrar

**Where is your domain registered?** (Where you bought `besthusbandever.com`)

Common registrars:
- **Namecheap** (namecheap.com)
- **GoDaddy** (godaddy.com)
- **Google Domains** (domains.google.com)
- **Cloudflare** (cloudflare.com)
- **Other**: Wherever you bought your domain

1. **Go to your domain registrar's website**
2. **Log in** to your account
3. **Find "DNS Management"** or "DNS Settings" or "Manage DNS"

**✅ Checkpoint**: You're logged into your domain registrar and can see DNS settings.

---

## 📋 Step 6: Add MX Records to Your Domain

**This is the most important step. Go slowly.**

1. **Find where to add DNS records**
   - Look for "Add Record" or "Create Record" button
   - Or look for "MX Records" section

2. **Add the MX record from Resend**
   - **Type**: Select "MX" from dropdown
   - **Name/Host**: Enter `@` (or leave blank if that's what Resend said)
   - **Value/Target**: Paste the value from Resend (e.g., `feedback-smtp.resend.com`)
   - **Priority**: Enter the priority from Resend (e.g., `10`)
   - **TTL**: Leave as default (usually 3600 or Auto)

3. **Save the record**
   - Click "Save" or "Add Record"
   - You should see the new MX record in your list

**⚠️ Important Notes**:
- If you already have MX records (for email), you might need to keep those AND add Resend's
- Some registrars allow multiple MX records with different priorities
- If you're not sure, take a screenshot and we can review

**✅ Checkpoint**: The MX record is added and saved in your domain registrar.

---

## 📋 Step 7: Wait for DNS Propagation

**This takes time. Be patient.**

1. **DNS changes take 1-24 hours to propagate** (usually 1-2 hours)
2. **You can check if it's working**:
   - Go to: https://mxtoolbox.com/
   - Enter your domain: `besthusbandever.com`
   - Click "MX Lookup"
   - You should see the Resend MX record appear

**✅ Checkpoint**: You've added the MX record and are waiting for it to propagate (or it's already working).

---

## 📋 Step 8: Set Up Webhook in Resend

**Go back to Resend Dashboard**

1. **Go back to**: Resend Dashboard → Domains → Your Domain → **Inbound** tab
2. **Look for "Webhook URL"** or "Webhook Settings"
3. **Enter this URL**:
   ```
   https://www.besthusbandever.com/api/webhooks/resend-inbound
   ```
4. **Save the webhook URL**

**What happens next**:
- Resend will show you a **Webhook Secret**
- This is a long random string
- **Copy this secret** - you'll need it in the next step

**✅ Checkpoint**: Webhook URL is set, and you have the Webhook Secret copied.

---

## 📋 Step 9: Add Webhook Secret to Vercel

1. **Go to**: https://vercel.com
2. **Log in** to your Vercel account
3. **Click on your project** (Best Husband Ever)
4. **Go to**: Settings → **Environment Variables**
5. **Click "Add New"**
6. **Add this variable**:
   - **Key**: `RESEND_INBOUND_WEBHOOK_SECRET`
   - **Value**: (Paste the webhook secret from Resend)
   - **Environment**: Select all (Production, Preview, Development)
7. **Click "Save"**

**✅ Checkpoint**: The webhook secret is added to Vercel environment variables.

---

## 📋 Step 10: Add Support Email (Optional but Recommended)

**Still in Vercel Environment Variables:**

1. **Add another variable** (if you don't have it):
   - **Key**: `SUPPORT_EMAIL`
   - **Value**: Your email address (e.g., `yourname@gmail.com` or `support@besthusbandever.com`)
   - **Environment**: Select all
2. **Click "Save"**

**Why**: This is where email replies will go (via the `replyTo` field we added).

**✅ Checkpoint**: Support email is set in Vercel.

---

## 📋 Step 11: Run Database Migration

**This creates the table to store email replies.**

1. **Go to**: https://supabase.com
2. **Log in** to your Supabase account
3. **Select your project**
4. **Click on "SQL Editor"** in the left sidebar
5. **Click "New Query"**
6. **Open the file**: `supabase/migrations/080_create_email_replies_table.sql`
7. **Copy ALL the SQL code** from that file
8. **Paste it** into the SQL Editor
9. **Click "Run"** (or press Ctrl+Enter)
10. **You should see**: "Success. No rows returned" or similar success message

**✅ Checkpoint**: The `email_replies` table is created in your database.

---

## 📋 Step 12: Verify Deployment

**The code is already deployed, but let's verify:**

1. **Go to**: https://vercel.com
2. **Check your latest deployment** - should show the commit we just made
3. **Make sure it says "Ready"** (green checkmark)

**If deployment failed**:
- Check the logs
- Make sure all environment variables are set
- Redeploy if needed

**✅ Checkpoint**: Code is deployed and live.

---

## 📋 Step 13: Test It!

**Now let's test if everything works:**

1. **Send yourself a test email**:
   - Reply to one of your daily action emails
   - Or send a new email to: `action@besthusbandever.com`
   - Write something like "Test reply"

2. **Wait 1-2 minutes** (for webhook to process)

3. **Check if it worked**:
   - **Option A**: Go to Supabase → Table Editor → `email_replies`
     - You should see a new row with your test email
   - **Option B**: Check Vercel Logs
     - Go to Vercel → Your Project → Logs
     - Look for webhook requests to `/api/webhooks/resend-inbound`
   - **Option C**: Check Resend Dashboard
     - Go to Resend → Domains → Inbound
     - Check "Recent Emails" - should show your test email

**✅ Checkpoint**: You sent a test email and can see it in the database or logs.

---

## 🎉 You're Done!

If everything worked:
- ✅ Email replies are now automatically captured
- ✅ They're stored in your database
- ✅ You can view them in Supabase
- ✅ Future replies will be handled automatically

---

## 🐛 Troubleshooting

### "MX records not working"
- **Wait longer**: DNS can take up to 24 hours
- **Check MX records**: Use https://mxtoolbox.com/ to verify
- **Double-check**: Make sure you entered the MX record exactly as Resend showed

### "Webhook not receiving emails"
- **Check webhook URL**: Make sure it's exactly `https://www.besthusbandever.com/api/webhooks/resend-inbound`
- **Check Vercel logs**: Look for errors
- **Verify deployment**: Make sure code is deployed
- **Check environment variables**: Make sure `RESEND_INBOUND_WEBHOOK_SECRET` is set

### "No emails in database"
- **Check Supabase**: Make sure migration ran successfully
- **Check table exists**: Go to Supabase → Table Editor → should see `email_replies`
- **Check Vercel logs**: Look for errors in webhook processing

### "Can't find MX records in domain registrar"
- **Different interface**: Every registrar is different
- **Look for "DNS" or "DNS Management"**: It might be called something else
- **Contact support**: Your registrar's support can help you add MX records

---

## 📞 Need Help?

If you get stuck at any step:
1. **Take a screenshot** of where you are
2. **Note which step** you're on
3. **Describe what you see** vs. what you expected

I can help you troubleshoot!

---

## ✅ Final Checklist

Before you're done, verify:
- [ ] MX records added to domain
- [ ] MX records propagated (check with mxtoolbox.com)
- [ ] Webhook URL set in Resend
- [ ] Webhook secret added to Vercel
- [ ] Support email set in Vercel
- [ ] Database migration run successfully
- [ ] Code deployed to Vercel
- [ ] Test email sent and received in database

**Once all checked, you're all set!** 🎉

