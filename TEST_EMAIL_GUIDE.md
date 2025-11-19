# How to Test Email Service

## Method 1: Using the Test Script (Easiest)

### Step 1: Make sure environment variables are set

Check your `.env.local` file has:
```env
RESEND_API_KEY=re_your_actual_api_key_here
CRON_SECRET=08f1a63aad04279af8722f158d22d12cb8440e42949be73acde14726d2bf5345
RESEND_FROM_EMAIL=Husband Daily Tips <onboarding@resend.dev>
TEST_EMAIL=your-email@example.com
```

Replace:
- `re_your_actual_api_key_here` with your Resend API key
- `your-email@example.com` with your actual email address

### Step 2: Install dotenv (if not already installed)

```bash
npm install dotenv
```

### Step 3: Run the test script

```bash
node test-email.js
```

### Step 4: Check your email

- Check your inbox
- Check spam/junk folder
- Check Resend dashboard → Emails (to see delivery status)

---

## Method 2: Test via API Endpoint (More Realistic)

### Step 1: Start your dev server

```bash
npm run dev
```

You should see:
```
▲ Next.js 14.x.x
- Local:        http://localhost:3000
```

### Step 2: Test the cron endpoint

Open a **new terminal window** (keep the dev server running) and run:

**On Windows (PowerShell):**
```powershell
$headers = @{
    "Authorization" = "Bearer 08f1a63aad04279af8722f158d22d12cb8440e42949be73acde14726d2bf5345"
}
Invoke-WebRequest -Uri "http://localhost:3000/api/cron/send-tomorrow-tips" -Method GET -Headers $headers
```

**On Mac/Linux (or Git Bash on Windows):**
```bash
curl -X GET "http://localhost:3000/api/cron/send-tomorrow-tips" \
  -H "Authorization: Bearer 08f1a63aad04279af8722f158d22d12cb8440e42949be73acde14726d2bf5345"
```

### Step 3: Check the response

You should see a JSON response like:
```json
{
  "success": true,
  "sent": 1,
  "errors": 0,
  "total": 1
}
```

### Step 4: Check your email

- The email will be sent to the email address in your user account
- Check your inbox and spam folder
- Check Resend dashboard for delivery status

---

## Method 3: Test in Browser (Simple)

### Step 1: Start your dev server

```bash
npm run dev
```

### Step 2: Open browser

Go to: `http://localhost:3000/api/cron/send-tomorrow-tips`

**But wait!** You'll get an "Unauthorized" error because we need to add the authorization header.

### Step 3: Use a browser extension

Install a browser extension like:
- **ModHeader** (Chrome/Edge)
- **Requestly** (Chrome/Firefox)

Add a header:
- **Name**: `Authorization`
- **Value**: `Bearer 08f1a63aad04279af8722f158d22d12cb8440e42949be73acde14726d2bf5345`

Then refresh the page.

---

## Method 4: Test in Production (After Deploying)

### Step 1: Deploy to Vercel

```bash
git push
```

Wait for deployment to complete.

### Step 2: Test the endpoint

Replace `your-domain.vercel.app` with your actual Vercel domain:

**On Windows (PowerShell):**
```powershell
$headers = @{
    "Authorization" = "Bearer 08f1a63aad04279af8722f158d22d12cb8440e42949be73acde14726d2bf5345"
}
Invoke-WebRequest -Uri "https://your-domain.vercel.app/api/cron/send-tomorrow-tips" -Method GET -Headers $headers
```

**On Mac/Linux:**
```bash
curl -X GET "https://your-domain.vercel.app/api/cron/send-tomorrow-tips" \
  -H "Authorization: Bearer 08f1a63aad04279af8722f158d22d12cb8440e42949be73acde14726d2bf5345"
```

---

## Troubleshooting

### "Unauthorized" Error

- Make sure `CRON_SECRET` in `.env.local` matches the Bearer token
- Check that you're using the correct secret: `08f1a63aad04279af8722f158d22d12cb8440e42949be73acde14726d2bf5345`

### "RESEND_API_KEY not configured"

- Make sure `.env.local` has `RESEND_API_KEY=re_your_key_here`
- Restart your dev server after adding environment variables

### Email Not Received

1. **Check Resend dashboard** → Emails tab
   - See if email was sent
   - Check delivery status
   - Look for error messages

2. **Check spam/junk folder**

3. **Verify email address** is correct in your user account

4. **Check Resend logs** for bounce/spam reports

### "Module not found" Error

If you get an error about `dotenv`, install it:
```bash
npm install dotenv
```

---

## What to Expect

### Successful Test

✅ You should see:
- Console message: "Email sent successfully"
- JSON response: `{"success": true, "sent": 1, ...}`
- Email in your inbox within a few seconds

### Email Content

The email should have:
- Subject: "Tomorrow's Action: [Tip Title]"
- Dark-themed design matching your app
- Tip title, content, and category
- Links to dashboard

---

## Next Steps After Testing

Once testing works:
1. ✅ Add environment variables to Vercel
2. ✅ Enable cron job in Vercel dashboard
3. ✅ Wait for first automatic run at 12pm
4. ✅ Monitor Resend dashboard for delivery

---

## Quick Test Checklist

- [ ] `.env.local` has `RESEND_API_KEY`
- [ ] `.env.local` has `CRON_SECRET`
- [ ] `.env.local` has `TEST_EMAIL` (optional, for test script)
- [ ] Dev server is running (`npm run dev`)
- [ ] Test script runs without errors
- [ ] Email received in inbox
- [ ] Checked Resend dashboard for delivery status

