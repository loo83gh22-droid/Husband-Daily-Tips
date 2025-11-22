# RLS Blocking Login - Fix Deployed

## Problem
After enabling Row Level Security (RLS), login was blocked because:
1. RLS policies check `current_setting('app.auth0_id', true)` 
2. This context isn't set when using Auth0 (external auth provider)
3. All queries were blocked, preventing user lookup/creation

## Solution
Updated `app/dashboard/page.tsx` to use `getSupabaseAdmin()` (service role key) for:
- User lookup during login (`getUserData()`)
- User creation if user doesn't exist

The service role key bypasses RLS, allowing these critical operations to work.

## Status
✅ **FIXED** - Changes deployed. Try logging in again!

## Note
If other queries are still blocked, we may need to:
1. Use admin client for more server-side operations
2. OR implement proper Auth0 context setting (more complex)

