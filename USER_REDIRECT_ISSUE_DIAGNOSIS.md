# User Redirect Issue Diagnosis

## Problem
User `keepitgreen@live.ca` signs in with Auth0 but gets redirected back to the landing page instead of the dashboard.

## Root Cause Analysis

### The Flow:
1. User clicks "Sign Up" → Goes to `/api/auth/login?returnTo=/dashboard`
2. Auth0 authenticates user
3. Auth0 redirects to `/api/auth/callback`
4. `afterCallback` hook runs → Should create user in Supabase
5. Auth0 redirects to `returnTo` URL (`/dashboard`)
6. Dashboard checks for user in Supabase
7. **If user doesn't exist** → Previously redirected to `/api/auth/logout` → Back to landing page ❌

### What We Fixed:

1. **Removed logout redirect** - Dashboard no longer redirects to logout if user doesn't exist
2. **Added upsert fallback** - If insert fails, tries upsert as fallback
3. **Better error handling** - Logs errors but doesn't break the flow
4. **Enhanced logging** - Added detailed logs to track user creation

## How to Debug

### Step 1: Check if User Exists in Supabase
Run this in Supabase SQL Editor:
```sql
SELECT * FROM users WHERE email = 'keepitgreen@live.ca';
```

### Step 2: Check Vercel Logs
1. Go to Vercel Dashboard → Your Project → Logs
2. Look for:
   - `Creating new user in Supabase: keepitgreen@live.ca`
   - `✅ User created successfully in Supabase`
   - `Error creating user in afterCallback`
   - `Error creating user in dashboard`

### Step 3: Check Auth0 Logs
1. Go to Auth0 Dashboard → Monitoring → Logs
2. Look for successful login events for `keepitgreen@live.ca`
3. Check if callback completed successfully

## Possible Issues

1. **afterCallback not running** - Check Vercel logs for "Creating new user" message
2. **User creation failing** - Check for error messages in logs
3. **Session not persisting** - Check if Auth0 session is being created
4. **Redirect loop** - If landing page keeps redirecting to dashboard and back

## What to Check Next

1. **Does the user exist in Supabase?** (Run the SQL query above)
2. **What do the Vercel logs show?** (Check for afterCallback execution)
3. **What does the browser console show?** (Any JavaScript errors?)
4. **What URL is the user on after login?** (Are they on `/dashboard` or `/`?)

## Next Steps

After checking the above, we can determine:
- If `afterCallback` is being called
- If user creation is failing
- If there's a redirect issue
- If the session is not persisting

