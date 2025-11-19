# How to Test Email Sending

## 🎯 Goal
Test that emails are sending from your new domain `besthusbandever.com`

---

## Step-by-Step Instructions

### Step 1: Open PowerShell
1. Press `Windows Key` + `X`
2. Click **"Windows PowerShell"** or **"Terminal"**
3. Or search for "PowerShell" in Windows search

### Step 2: Run the Test Command
1. Copy this entire command:
   ```powershell
   $headers = @{ "Authorization" = "Bearer 08f1a63aad04279af8722f158d22d12cb8440e42949be73acde14726d2bf5345" }; $response = Invoke-WebRequest -Uri "https://besthusbandever.com/api/cron/send-tomorrow-tips" -Method GET -Headers $headers; $response.Content
   ```

2. **Paste it into PowerShell** (right-click to paste, or `Ctrl+V`)
3. Press **Enter**

### Step 3: Check the Response
You should see a JSON response like:
```json
{
  "success": true,
  "sent": 1,
  "errors": 0,
  "total": 1
}
```

### Step 4: Check Your Email
1. Go to your email inbox (the one you used to sign up)
2. Look for an email from `tips@besthusbandever.com`
3. Subject: "Tomorrow's Action: [Tip Title]"
4. Check spam folder if you don't see it

---

## ✅ Success Criteria

- Command runs without errors
- Response shows `"success": true`
- Email arrives in your inbox
- Email comes from `tips@besthusbandever.com`

---

## 🐛 Troubleshooting

### If Command Fails:
- Make sure you're using PowerShell (not Command Prompt)
- Check that your domain is live: `https://besthusbandever.com`
- Make sure Vercel deployment is successful

### If Email Doesn't Arrive:
- Check spam folder
- Wait a few minutes (email delivery can be delayed)
- Check Resend dashboard for email status
- Verify your email address in the database

---

## 📝 Alternative: Test via Browser

You can also test by visiting this URL in your browser:
```
https://besthusbandever.com/api/cron/send-tomorrow-tips
```

**But:** This will fail because it needs the authorization header. The PowerShell command is the correct way to test.

---

**Go run the PowerShell command now!** 🚀

