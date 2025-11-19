# Step 6: Test Everything

## 🎯 Goal
Verify that everything works on your new domain `besthusbandever.com`

---

## Test 1: Website Loads on New Domain

### What to Do:
1. Open a new browser tab (or incognito/private window)
2. Go to: `https://besthusbandever.com`
3. **Expected:** Your app should load (landing page or dashboard)

### ✅ Success Criteria:
- Website loads without errors
- No "Invalid SSL" or "Connection Error" messages
- You see your app content

### 🐛 If It Doesn't Work:
- Wait a few minutes (DNS might still be propagating)
- Try `http://besthusbandever.com` (should redirect to https)
- Check Vercel deployment status
- Make sure domain shows "Valid" in Vercel

---

## Test 2: Login/Logout Works

### What to Do:
1. On `https://besthusbandever.com`, click **"Sign In"** or **"Login"**
2. **Expected:** Should redirect to Auth0 login page
3. Log in with your Auth0 account
4. **Expected:** Should redirect back to `https://besthusbandever.com/dashboard`
5. Try logging out
6. **Expected:** Should redirect back to `https://besthusbandever.com`

### ✅ Success Criteria:
- Login redirects to Auth0
- After login, redirects back to your domain (not localhost)
- Logout works correctly
- No "Invalid Callback URL" errors

### 🐛 If It Doesn't Work:
- Check Auth0 callback URLs are correct
- Make sure you saved changes in Auth0
- Check browser console for errors (F12 → Console)
- Try clearing browser cache

---

## Test 3: Email Sending Works

### What to Do:
1. Make sure Resend domain is verified (check Resend dashboard)
2. Test the email cron job:
   - Use the same PowerShell command as before:
   ```powershell
   $headers = @{ "Authorization" = "Bearer 08f1a63aad04279af8722f158d22d12cb8440e42949be73acde14726d2bf5345" }; $response = Invoke-WebRequest -Uri "https://besthusbandever.com/api/cron/send-tomorrow-tips" -Method GET -Headers $headers; $response.Content
   ```
   - **Note:** Use `https://besthusbandever.com` instead of `localhost:3000`
3. Check your email inbox
4. **Expected:** Email should come from `tips@besthusbandever.com`

### ✅ Success Criteria:
- Email sends successfully
- Email comes from `tips@besthusbandever.com` (not `onboarding@resend.dev`)
- Email content looks correct

### 🐛 If It Doesn't Work:
- Check Resend domain is verified (should show green checkmark)
- Check `RESEND_FROM_EMAIL` is correct in Vercel
- Check email in spam folder
- Check Resend dashboard for error messages

---

## Test 4: Local Development Still Works (Optional)

### What to Do:
1. Update `.env.local` to use `localhost:3000` for local dev (if you changed it)
2. Or keep it as is and test locally
3. Run `npm run dev`
4. Go to `http://localhost:3000`
5. **Expected:** Should still work for local development

### ✅ Success Criteria:
- Local development works
- Can test changes locally before deploying

---

## ✅ Complete Checklist

- [ ] Website loads on `https://besthusbandever.com`
- [ ] Login works (redirects to Auth0 and back)
- [ ] Logout works
- [ ] Email sending works (if Resend is verified)
- [ ] Email comes from `tips@besthusbandever.com`
- [ ] Local development still works (optional)

---

## 🎉 Success!

If all tests pass, **you're done!** Your domain setup is complete!

---

## 🐛 Troubleshooting

### Website Doesn't Load:
- Wait 5-10 minutes (DNS propagation)
- Check Vercel deployment status
- Verify domain shows "Valid" in Vercel

### Login Doesn't Work:
- Check Auth0 callback URLs
- Make sure you saved changes
- Check browser console for errors

### Email Doesn't Send:
- Check Resend domain is verified
- Check environment variables in Vercel
- Check Resend dashboard for errors

---

**Go test everything now, then come back and tell me the results!** 🚀

