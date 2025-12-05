# Troubleshooting Signup Error

## Current Issue
User `keepitgreen@live.ca` is getting "Application error: a server-side exception has occurred" when trying to sign up.

## Steps to Diagnose

### 1. Check Vercel Logs
Go to Vercel Dashboard → Your Project → Logs

Look for:
- Any errors with `afterCallback:` prefix
- Stack traces
- The exact error message and line number

### 2. Check if User Exists in Supabase
Run this in Supabase SQL Editor:
```sql
SELECT * FROM users WHERE email = 'keepitgreen@live.ca' OR auth0_id LIKE '%keepitgreen%';
```

### 3. Check if User Exists in Auth0
- Go to Auth0 Dashboard → User Management → Users
- Search for `keepitgreen@live.ca`
- If user exists, delete them to allow fresh signup

### 4. Test Environment Variables
The `afterCallback` requires these environment variables in Vercel:
- `NEXT_PUBLIC_SUPABASE_URL` ✅
- `SUPABASE_SERVICE_ROLE_KEY` ✅
- `RESEND_API_KEY` (optional, for welcome emails)

### 5. Check Recent Deployments
- Verify the latest commit `147bd33` is deployed
- Check deployment status in Vercel
- Look for any build errors

## What Should Happen

1. User clicks "Sign Up" → Auth0 handles authentication
2. Auth0 redirects to `/api/auth/callback`
3. `afterCallback` hook runs:
   - Checks if user exists in Supabase
   - Creates user if they don't exist
   - Sends welcome email (non-blocking)
   - **ALWAYS returns session** (even if errors occur)
4. User is redirected to dashboard

## If Error Persists

The `afterCallback` is designed to **never fail** - it always returns the session even if:
- Supabase is down
- User creation fails
- Email sending fails

If you're still getting errors, the issue might be:
1. **Before afterCallback runs**: Auth0 configuration issue
2. **In afterCallback**: Check Vercel logs for specific error
3. **After afterCallback**: Dashboard page issue

## Next Steps

1. **Check Vercel logs** for the exact error message
2. **Share the error** from Vercel logs (copy the full stack trace)
3. **Check Supabase** to see if user was created despite the error
4. **Try signing up again** after checking logs

