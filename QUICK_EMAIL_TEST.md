# Quick Email Test - Step by Step

## ✅ Prerequisites

Before testing, make sure you have:
1. ✅ Resend API key in `.env.local`
2. ✅ CRON_SECRET in `.env.local`
3. ✅ At least one user in your database (your account)

---

## 🚀 Method 1: Test via API Endpoint (Easiest & Recommended)

### Step 1: Add your email to .env.local (if not already there)

Open `.env.local` and add:
```env
TEST_EMAIL=your-actual-email@example.com
```

Replace with your real email address.

### Step 2: Start your dev server

Open a terminal and run:
```bash
npm run dev
```

Wait until you see:
```
▲ Next.js 14.x.x
- Local:        http://localhost:3000
✓ Ready in X seconds
```

### Step 3: Open a NEW terminal window

**Keep the dev server running!** Open a new terminal window/tab.

### Step 4: Test the email endpoint

**On Windows (PowerShell):**

Copy and paste this entire command (replace with your actual email if needed):

```powershell
$headers = @{
    "Authorization" = "Bearer 08f1a63aad04279af8722f158d22d12cb8440e42949be73acde14726d2bf5345"
}
$response = Invoke-WebRequest -Uri "http://localhost:3000/api/cron/send-tomorrow-tips" -Method GET -Headers $headers
$response.Content
```

**On Mac/Linux (or Git Bash on Windows):**

```bash
curl -X GET "http://localhost:3000/api/cron/send-tomorrow-tips" \
  -H "Authorization: Bearer 08f1a63aad04279af8722f158d22d12cb8440e42949be73acde14726d2bf5345"
```

### Step 5: Check the response

You should see JSON like:
```json
{
  "success": true,
  "sent": 1,
  "errors": 0,
  "total": 1
}
```

**If you see:**
- `"sent": 1` = ✅ Email was sent!
- `"errors": 0` = ✅ No errors!
- `"sent": 0` = ❌ Check the terminal where `npm run dev` is running for error messages

### Step 6: Check your email

1. **Check your inbox** (the email address you used to sign up)
2. **Check spam/junk folder**
3. **Wait 10-30 seconds** (emails can take a moment)
4. **Check Resend dashboard** → Emails tab (to see delivery status)

---

## 🎯 What Success Looks Like

✅ **Terminal shows**: `"sent": 1, "errors": 0`  
✅ **Email received** in your inbox  
✅ **Resend dashboard** shows email as "Delivered"

---

## ❌ Troubleshooting

### "Unauthorized" Error

- Make sure `CRON_SECRET` in `.env.local` matches: `08f1a63aad04279af8722f158d22d12cb8440e42949be73acde14726d2bf5345`
- Restart your dev server after adding environment variables

### "sent": 0 or errors

1. **Check the terminal** where `npm run dev` is running
   - Look for red error messages
   - Common: "RESEND_API_KEY not configured"

2. **Check .env.local** has:
   ```env
   RESEND_API_KEY=re_your_actual_key_here
   ```

3. **Restart dev server** after adding environment variables

### Email Not Received

1. **Check Resend dashboard** → Emails
   - See if email was sent
   - Check delivery status
   - Look for bounce/spam reports

2. **Check spam folder**

3. **Verify email address** in your user account (the one you used to sign up)

---

## 📧 Alternative: Test with Browser Extension

If the command line is confusing:

1. Install **ModHeader** extension (Chrome/Edge)
2. Add header:
   - Name: `Authorization`
   - Value: `Bearer 08f1a63aad04279af8722f158d22d12cb8440e42949be73acde14726d2bf5345`
3. Go to: `http://localhost:3000/api/cron/send-tomorrow-tips`
4. You'll see the JSON response

---

## ✅ Next Steps After Successful Test

Once you see `"sent": 1` and receive the email:

1. ✅ Add environment variables to Vercel
2. ✅ Enable cron job in Vercel dashboard
3. ✅ Wait for first automatic run at 12pm tomorrow

---

**That's it!** The easiest way is Method 1 - just run the PowerShell or curl command while your dev server is running.

