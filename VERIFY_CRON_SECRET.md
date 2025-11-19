# Verify CRON_SECRET Setup

## 🔍 Step-by-Step Verification

### Step 1: Check Vercel Environment Variables
1. Go to [vercel.com](https://vercel.com)
2. Your Project → **Settings** → **Environment Variables**
3. Look for `CRON_SECRET` in the list

**If you DON'T see it:**
- Click **"Add New"** or **"Add"**
- Name: `CRON_SECRET`
- Value: `08f1a63aad04279af8722f158d22d12cb8440e42949be73acde14726d2bf5345`
- Environment: ✅ Production, ✅ Preview, ✅ Development
- Click **"Save"**

**If you DO see it:**
- Click on it to view/edit
- Verify the value is exactly: `08f1a63aad04279af8722f158d22d12cb8440e42949be73acde14726d2bf5345`
- Verify all environments are checked
- If wrong, update and save

### Step 2: Redeploy
1. Go to **Deployments** tab
2. Find the latest deployment
3. Click the three dots (⋯) → **"Redeploy"**
4. Wait for it to finish (green checkmark = "Ready")

### Step 3: Test Locally First
1. Make sure `.env.local` has:
   ```env
   CRON_SECRET=08f1a63aad04279af8722f158d22d12cb8440e42949be73acde14726d2bf5345
   ```

2. Start dev server (if not running):
   ```bash
   npm run dev
   ```

3. Test with localhost:
   ```powershell
   $headers = @{ "Authorization" = "Bearer 08f1a63aad04279af8722f158d22d12cb8440e42949be73acde14726d2bf5345" }; $response = Invoke-WebRequest -Uri "http://localhost:3000/api/cron/send-tomorrow-tips" -Method GET -Headers $headers; $response.Content
   ```

**If localhost works:** The code is fine, it's a Vercel configuration issue.
**If localhost fails:** Check `.env.local` has CRON_SECRET.

### Step 4: Test Production Again
After verifying Vercel has CRON_SECRET and you've redeployed:
```powershell
$headers = @{ "Authorization" = "Bearer 08f1a63aad04279af8722f158d22d12cb8440e42949be73acde14726d2bf5345" }; $response = Invoke-WebRequest -Uri "https://besthusbandever.com/api/cron/send-tomorrow-tips" -Method GET -Headers $headers; $response.Content
```

---

## ✅ Checklist

- [ ] `CRON_SECRET` exists in Vercel environment variables
- [ ] Value is exactly: `08f1a63aad04279af8722f158d22d12cb8440e42949be73acde14726d2bf5345`
- [ ] Set for Production, Preview, Development
- [ ] Redeployed after adding/updating
- [ ] Latest deployment is "Ready"
- [ ] Tested locally (works or fails?)
- [ ] Tested production again

---

**Go verify CRON_SECRET in Vercel, then test locally first!**

