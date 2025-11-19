# Fix CRON_SECRET 401 Error

## 🐛 Problem
Getting `401 Unauthorized` when testing the email endpoint.

## ✅ Solution
The `CRON_SECRET` needs to be in Vercel environment variables.

---

## Step-by-Step Fix

### Step 1: Check Your CRON_SECRET Value
Your CRON_SECRET should be:
```
08f1a63aad04279af8722f158d22d12cb8440e42949be73acde14726d2bf5345
```

### Step 2: Add to Vercel Environment Variables
1. Go to [vercel.com](https://vercel.com) → Your Project
2. Click **Settings** → **Environment Variables**
3. Look for `CRON_SECRET` in the list

**If it's NOT there:**
1. Click **"Add New"** or **"Add"** button
2. **Name:** `CRON_SECRET`
3. **Value:** `08f1a63aad04279af8722f158d22d12cb8440e42949be73acde14726d2bf5345`
4. **Environment:** Check all three:
   - ✅ Production
   - ✅ Preview
   - ✅ Development
5. Click **"Save"**

**If it IS there but different:**
1. Click **"Edit"** on `CRON_SECRET`
2. **Value:** Make sure it's exactly: `08f1a63aad04279af8722f158d22d12cb8440e42949be73acde14726d2bf5345`
3. **Environment:** Make sure all three are checked
4. Click **"Save"**

### Step 3: Redeploy
1. Go to **Deployments** tab
2. Click the three dots (⋯) on the latest deployment
3. Click **"Redeploy"**
4. Wait for deployment to complete

### Step 4: Test Again
Run the PowerShell command again:
```powershell
$headers = @{ "Authorization" = "Bearer 08f1a63aad04279af8722f158d22d12cb8440e42949be73acde14726d2bf5345" }; $response = Invoke-WebRequest -Uri "https://besthusbandever.com/api/cron/send-tomorrow-tips" -Method GET -Headers $headers; $response.Content
```

---

## ✅ Quick Checklist

- [ ] `CRON_SECRET` exists in Vercel environment variables
- [ ] Value matches: `08f1a63aad04279af8722f158d22d12cb8440e42949be73acde14726d2bf5345`
- [ ] Set for Production, Preview, and Development
- [ ] Redeployed after adding/updating
- [ ] Test command works

---

## 🐛 Still Not Working?

**Check:**
1. Make sure `CRON_SECRET` is exactly the same in:
   - `.env.local` (local)
   - Vercel environment variables (production)
2. Make sure you redeployed after adding it
3. Wait a minute for deployment to complete
4. Try the test command again

---

**Go add `CRON_SECRET` to Vercel now, then redeploy and test again!** 🚀

