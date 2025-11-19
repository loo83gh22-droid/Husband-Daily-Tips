# Email Service Setup - Next Steps

## ✅ What's Done

- ✅ Resend package installed
- ✅ Email code uncommented and working
- ✅ Environment variables added to `.env.local`
- ✅ Test successful (error resolved)

---

## 🧪 Step 1: Verify Email Was Sent

### Check Your Email
1. **Check your inbox** (the email you used to sign up)
2. **Check spam/junk folder**
3. **Wait 10-30 seconds** (emails can take a moment)

### Check Resend Dashboard
1. Go to [resend.com](https://resend.com) → Dashboard
2. Click **"Emails"** in the left sidebar
3. You should see the test email with delivery status

**If you see the email:**
- ✅ Email service is working!
- ✅ Move to Step 2 (Production Setup)

**If you don't see the email:**
- Check Resend dashboard for error messages
- Verify your email address in your user account
- Check spam folder

---

## 🚀 Step 2: Set Up for Production (Vercel)

### Add Environment Variables to Vercel

1. **Go to Vercel Dashboard**
   - Visit [vercel.com](https://vercel.com)
   - Log in and select your project

2. **Navigate to Settings**
   - Click on your project
   - Go to **Settings** → **Environment Variables**

3. **Add These 3 Variables:**

   Click **"Add New"** for each:

   **Variable 1:**
   - **Name**: `RESEND_API_KEY`
   - **Value**: `re_your_actual_api_key_here` (your Resend API key)
   - **Environment**: Select all (Production, Preview, Development)

   **Variable 2:**
   - **Name**: `CRON_SECRET`
   - **Value**: `08f1a63aad04279af8722f158d22d12cb8440e42949be73acde14726d2bf5345`
   - **Environment**: Select all (Production, Preview, Development)

   **Variable 3:**
   - **Name**: `RESEND_FROM_EMAIL`
   - **Value**: `Husband Daily Tips <onboarding@resend.dev>`
   - **Environment**: Select all (Production, Preview, Development)

4. **Save and Redeploy**
   - After adding variables, Vercel will prompt you to redeploy
   - Or manually trigger a redeploy from the Deployments tab

---

## ⏰ Step 3: Enable Cron Job in Vercel

The cron job is already configured in `vercel.json`, but you need to enable it:

1. **Go to Vercel Dashboard**
   - Your project → **Settings** → **Cron Jobs**

2. **Enable the Cron Job**
   - You should see: `/api/cron/send-tomorrow-tips`
   - Make sure it's **enabled** (toggle switch)
   - **Schedule**: `0 12 * * *` (12pm daily)
   - **Timezone**: Set your timezone (e.g., `America/New_York`)

3. **Verify Configuration**
   - Path: `/api/cron/send-tomorrow-tips`
   - Schedule: `0 12 * * *` (runs at 12pm daily)
   - Timezone: Your local timezone

---

## ✅ Step 4: Test in Production (Optional)

After deploying to Vercel, you can test the production endpoint:

**PowerShell:**
```powershell
$headers = @{
    "Authorization" = "Bearer 08f1a63aad04279af8722f158d22d12cb8440e42949be73acde14726d2bf5345"
}
$response = Invoke-WebRequest -Uri "https://your-domain.vercel.app/api/cron/send-tomorrow-tips" -Method GET -Headers $headers
$response.Content
```

Replace `your-domain.vercel.app` with your actual Vercel domain.

---

## 🎉 Done!

Once you complete Steps 2 and 3:

✅ **Email service is fully set up**  
✅ **Cron job will run automatically** at 12pm daily  
✅ **All users will receive** tomorrow's tip preview  

---

## 📊 Monitor Email Delivery

### Resend Dashboard
- Go to Resend → **Emails** tab
- See all sent emails
- Check delivery status
- Monitor bounce/spam rates

### Vercel Function Logs
- Go to Vercel → Your project → **Functions** tab
- Click on the cron job
- See execution logs
- Check for errors

---

## 🔄 What Happens Next

1. **Tomorrow at 12pm** (or next scheduled time):
   - Cron job runs automatically
   - Gets all users from database
   - Assigns tomorrow's tip to each user
   - Sends email with tip preview

2. **Users receive email** with:
   - Tomorrow's tip title
   - Tip content
   - Category badge
   - Link to dashboard

3. **Tips are pre-assigned** in the database, so when users log in tomorrow, they'll see the same tip they got in the email.

---

## 🐛 Troubleshooting

### Cron Job Not Running
- Check Vercel → Settings → Cron Jobs (make sure it's enabled)
- Verify timezone is set correctly
- Check Vercel function logs for errors

### Emails Not Sending
- Check Resend dashboard for error messages
- Verify `RESEND_API_KEY` is correct in Vercel
- Check Vercel function logs

### Rate Limits
- Resend free tier: 3,000 emails/month, 100/day
- Monitor usage in Resend dashboard
- Upgrade plan if needed

---

## 📝 Optional: Verify Domain (For Production)

For a more professional email address:

1. Go to Resend → **Domains**
2. Add your domain (e.g., `yourdomain.com`)
3. Add DNS records to your domain registrar
4. Wait for verification
5. Update `RESEND_FROM_EMAIL` to: `Husband Daily Tips <tips@yourdomain.com>`

**For now**, `onboarding@resend.dev` works fine for testing!

---

**You're all set!** The email service is ready. Just complete Steps 2 and 3 above to enable it in production.

