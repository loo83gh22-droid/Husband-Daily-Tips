# Quick Deployment Guide

## ✅ Code Pushed to GitHub
Your code has been committed and pushed to `main` branch.

## 🚀 Next Steps

### 1. Vercel Auto-Deployment
If Vercel is connected to your GitHub repo, it should **automatically deploy** the new changes.

**Check:**
- Go to [vercel.com/dashboard](https://vercel.com/dashboard)
- Find your project
- Look for a new deployment (should show "Building..." then "Ready")

### 2. Verify Environment Variables
**Important:** Make sure these are set in Vercel:

Go to: Vercel Dashboard → Your Project → Settings → Environment Variables

**Required Variables:**
```
AUTH0_SECRET
AUTH0_BASE_URL=https://your-app.vercel.app  (UPDATE THIS to your actual Vercel URL)
AUTH0_ISSUER_BASE_URL
AUTH0_CLIENT_ID
AUTH0_CLIENT_SECRET
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
```

**Optional (for email):**
```
RESEND_API_KEY
RESEND_FROM_EMAIL
CRON_SECRET
```

### 3. Update Auth0 Settings
**Important:** Update Auth0 with your production URL:

1. Go to [Auth0 Dashboard](https://manage.auth0.com)
2. Applications → Your App → Settings
3. Update these URLs (replace with your actual Vercel URL):
   - **Allowed Callback URLs:** 
     - `https://your-app.vercel.app/api/auth/callback`
   - **Allowed Logout URLs:**
     - `https://your-app.vercel.app`
   - **Allowed Web Origins:**
     - `https://your-app.vercel.app`

### 4. Verify Cron Job
1. Go to Vercel Dashboard → Your Project → Settings → Cron Jobs
2. Verify `/api/cron/send-tomorrow-tips` is listed with schedule `0 12 * * *`
3. If missing, add it manually

---

## ✅ Post-Deployment Testing

Once deployed, test on your live site:

### Test 1: Homepage
- [ ] Visit live URL
- [ ] Homepage loads correctly

### Test 2: Authentication
- [ ] Click "Sign In" or "Get Started"
- [ ] Redirects to Auth0
- [ ] Log in successfully
- [ ] Redirects back to dashboard

### Test 3: Daily Action
- [ ] Dashboard shows an **action** (not tip)
- [ ] Action has icon (emoji)
- [ ] Action has name
- [ ] Action has description
- [ ] **"Why this matters"** section appears with benefit text

### Test 4: Complete Action
- [ ] Click "Mark as done"
- [ ] Action marks as completed
- [ ] Reflection modal appears
- [ ] Health bar increases slightly

### Test 5: Badges
- [ ] Go to `/dashboard/badges`
- [ ] Badges display
- [ ] **No "+X health" or "+X health bonus" text shown**

### Test 6: Health Bar
- [ ] Health bar displays correctly
- [ ] Milestone markers visible (50, 60, 70, 80, 90, 100)
- [ ] No errors in browser console

---

## 🐛 Troubleshooting

### Build Fails
- Check Vercel build logs for errors
- Verify all environment variables are set
- Check that all dependencies are in `package.json`

### Auth0 Redirect Issues
- Verify `AUTH0_BASE_URL` matches your Vercel URL exactly
- Check Auth0 callback URLs are correct
- Ensure no trailing slashes in URLs

### Database Errors
- Verify Supabase environment variables are correct
- Check Supabase project is active
- Verify migrations were run in Supabase

### Actions Not Showing
- Check Supabase: `SELECT COUNT(*) FROM actions;` (should be 60)
- Verify `user_daily_actions` table exists
- Check browser console for errors

---

## 🎉 You're Live!

Once all tests pass, your site is ready. Users will now get:
- Daily actions (not tips)
- Actions with benefits explaining why they matter
- Health capped at 6 points per day
- Badges as reference only (no health boost)

