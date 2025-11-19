# Email Setup - Quick Start Guide 🚀

## ✅ Current Status

### DNS Records Setup
- ✅ **DKIM**: Verified (TXT record `resend._domainkey`)
- ⏳ **SPF**: Pending (TXT record `send` - waiting for DNS propagation)
- ⏳ **MX**: Pending (MX record `send` - waiting for DNS propagation)
- ✅ **DMARC**: Added (TXT record `_dmarc`)

**DNS propagation**: Can take 15-30 minutes (sometimes up to 24 hours)

---

## 🎯 What You Need to Complete

### 1. Get Your Resend API Key (2 minutes)

1. Go to [resend.com](https://resend.com) → Sign in
2. Navigate to **API Keys** in the dashboard
3. Click **Create API Key**
4. Name it: `Best Husband Ever Production`
5. **Copy the API key** (starts with `re_`)

### 2. Wait for DNS Verification (15-30 minutes)

Once SPF and MX records show as **Verified** (not Pending) in Resend:
- Your domain is ready to send emails
- You can use `tips@yourdomain.com` as the from address

### 3. Add Environment Variables

#### For Local Development (`.env.local`):

Add these three lines to your `.env.local` file:

```env
# Resend Email
RESEND_API_KEY=re_your_api_key_here
RESEND_FROM_EMAIL=Best Husband Ever <tips@yourdomain.com>
CRON_SECRET=18a8a438f273c04f5879d2e8160ee5d63e9eb0522f82522a392c703cc064998f
```

**Replace:**
- `re_your_api_key_here` → Your Resend API key (from Step 1)
- `tips@yourdomain.com` → Your verified domain email
- The CRON_SECRET is already generated above ✅

#### For Vercel (Production):

1. Go to your Vercel project dashboard
2. **Settings** → **Environment Variables**
3. Add these three variables:
   - `RESEND_API_KEY` = your Resend API key
   - `RESEND_FROM_EMAIL` = `Best Husband Ever <tips@yourdomain.com>`
   - `CRON_SECRET` = `18a8a438f273c04f5879d2e8160ee5d63e9eb0522f82522a392c703cc064998f`
4. Make sure to set them for **Production** environment
5. Click **Save**

### 4. Verify Cron Job is Enabled

The cron job is already configured in `vercel.json`:
- ✅ Path: `/api/cron/send-tomorrow-tips`
- ✅ Schedule: `0 12 * * *` (12pm daily)

**Verify in Vercel:**
1. Go to your project → **Settings** → **Cron Jobs**
2. You should see the cron job listed
3. Make sure it's **enabled**

---

## 🧪 Testing

### Test Locally (after adding to `.env.local`):

```bash
# Make sure your dev server is running
npm run dev

# In another terminal, test the endpoint:
curl -X GET "http://localhost:3000/api/cron/send-tomorrow-tips?secret=18a8a438f273c04f5879d2e8160ee5d63e9eb0522f82522a392c703cc064998f"
```

### Test in Production (after deploying to Vercel):

```bash
curl -X GET "https://your-project.vercel.app/api/cron/send-tomorrow-tips" \
  -H "Authorization: Bearer 18a8a438f273c04f5879d2e8160ee5d63e9eb0522f82522a392c703cc064998f"
```

**Check Resend Dashboard**:
1. Go to Resend → **Emails** tab
2. You should see the test email sent
3. Check delivery status

---

## ✅ Checklist

- [ ] Got Resend API key
- [ ] DNS records verified in Resend (SPF and MX show "Verified")
- [ ] Added `RESEND_API_KEY` to `.env.local`
- [ ] Added `RESEND_FROM_EMAIL` to `.env.local`
- [ ] Added `CRON_SECRET` to `.env.local` (already provided above)
- [ ] Added all three variables to Vercel environment variables
- [ ] Verified cron job is enabled in Vercel
- [ ] Tested email sending locally
- [ ] Tested email sending in production
- [ ] Checked Resend dashboard for email delivery

---

## 📧 How It Works

- **Time**: Emails send daily at 12pm (noon)
- **Content**: Tomorrow's tip preview (Atomic Habits style)
- **Recipients**: All active users with email addresses
- **Purpose**: Give users a heads up so they can plan ahead

---

## 🆘 Troubleshooting

### DNS Records Still Pending?

- Wait 15-30 minutes
- Verify records are correct in Namecheap
- Check values match exactly what Resend shows
- Use DNS checker: https://mxtoolbox.com/

### Emails Not Sending?

1. **Check Resend Dashboard** → **Emails** tab for errors
2. **Check Vercel Logs** → **Functions** tab for errors
3. **Verify Environment Variables** are set correctly
4. **Check API Key** is correct in both places

### Cron Job Not Running?

1. Verify cron job is enabled in Vercel
2. Check `CRON_SECRET` matches in environment variables
3. Wait until 12pm to see if it runs automatically
4. Check Vercel logs for cron execution

---

## 📚 More Details

See `RESEND_SETUP_CHECKLIST.md` for complete troubleshooting guide.

See `EMAIL_SETUP_GUIDE.md` for full documentation.

---

**You're almost done!** Just need to:
1. Get your Resend API key
2. Wait for DNS verification
3. Add environment variables
4. Test!

