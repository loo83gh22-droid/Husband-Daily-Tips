# Deployment Checklist - Live Site

## Pre-Deployment Checks

### ✅ Database Migrations
- [x] Migration 010 - Benefits added to actions, user_daily_actions table created
- [x] Migration 011 - Badge bonuses set to 0, daily_health_points table created
- [x] All migrations verified successfully

### ✅ Code Changes
- [x] Dashboard pulls from actions table (not tips)
- [x] Health calculation capped at 6 points per day
- [x] Badge health bonuses removed
- [x] Email cron uses actions
- [x] All code tested and working

---

## Deployment Steps

### 1. Commit & Push Code to GitHub
```bash
git add .
git commit -m "Update: Switch to actions-based daily prompts, cap health at 6/day, remove badge bonuses"
git push origin main
```

### 2. Verify Environment Variables in Vercel
Make sure these are set in Vercel Dashboard → Settings → Environment Variables:

**Required:**
- `AUTH0_SECRET`
- `AUTH0_BASE_URL` (your production URL, e.g., `https://your-app.vercel.app`)
- `AUTH0_ISSUER_BASE_URL`
- `AUTH0_CLIENT_ID`
- `AUTH0_CLIENT_SECRET`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

**Optional (for email):**
- `RESEND_API_KEY`
- `RESEND_FROM_EMAIL`
- `CRON_SECRET`

### 3. Update Auth0 Callback URLs
In Auth0 Dashboard → Applications → Your App → Settings:

**Allowed Callback URLs:**
- `http://localhost:3000/api/auth/callback`
- `https://your-app.vercel.app/api/auth/callback`

**Allowed Logout URLs:**
- `http://localhost:3000`
- `https://your-app.vercel.app`

**Allowed Web Origins:**
- `http://localhost:3000`
- `https://your-app.vercel.app`

### 4. Deploy to Vercel
- Vercel will auto-deploy when you push to GitHub
- Or manually trigger in Vercel Dashboard → Deployments → Redeploy

### 5. Verify Cron Job
- Go to Vercel Dashboard → Settings → Cron Jobs
- Verify `/api/cron/send-tomorrow-tips` is scheduled for `0 12 * * *` (12pm daily)
- If not auto-configured, add it manually

---

## Post-Deployment Testing

### Test Checklist:
1. [ ] Visit live site - can access homepage
2. [ ] Click "Sign In" - redirects to Auth0
3. [ ] Log in - redirects back to dashboard
4. [ ] Dashboard shows an **action** (not tip) with:
   - Icon (emoji)
   - Action name
   - Description
   - "Why this matters" section
5. [ ] Complete the action - marks as done
6. [ ] Health bar increases (small amount)
7. [ ] Visit badges page - no health bonus displayed
8. [ ] Check browser console for errors

---

## Rollback Plan (If Needed)

If something goes wrong:
1. Go to Vercel Dashboard → Deployments
2. Find previous working deployment
3. Click "..." → "Promote to Production"

---

## Notes

- **Health Calculation**: Now uses daily action completions, capped at 6 points per day
- **Badges**: Reference only (0 health bonus)
- **Daily Actions**: Pulls from 60 actions, avoids last 30 days
- **Email**: Sends action preview (if Resend is configured)

