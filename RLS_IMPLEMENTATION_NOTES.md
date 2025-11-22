# Row Level Security (RLS) Implementation Notes

## Overview

We've enabled Row Level Security (RLS) on all user-data tables as a **defense-in-depth** security measure. This ensures that even if API authorization is bypassed, users cannot access other users' data at the database level.

## Important Context

### Auth0 vs Supabase Auth

- **We use Auth0** for authentication (not Supabase's built-in auth)
- **Supabase RLS** is designed for Supabase Auth users (using `auth.uid()`)
- Since we use Auth0, we need a custom approach

### Current Implementation

1. **RLS Policies**: Check `current_setting('app.auth0_id')` to identify the current user
2. **Session Context**: The `auth0_id` must be set in the PostgreSQL session context before queries
3. **Helper Function**: `set_auth0_context(auth0_id)` function sets the context (migration 029)

### Limitations

⚠️ **Important**: Due to PostgREST's connection pooling, setting session variables may not persist across requests. Therefore:

1. **Primary Security**: Application-level authorization (checking session, filtering by user_id)
2. **Secondary Security**: RLS policies (defense-in-depth)
3. **Service Role Key**: Used for admin operations - **bypasses RLS entirely**

## How It Works

### For User Queries (Using Anon Key)

1. Application gets Auth0 session
2. Application calls `set_auth0_context(auth0_id)` via RPC (if available)
3. Application makes queries using anon key
4. RLS policies check `current_setting('app.auth0_id')` and filter results

### For Admin Queries (Using Service Role Key)

1. Application uses service role key (bypasses RLS)
2. **MUST** explicitly filter by `user_id` in WHERE clauses
3. **MUST** verify user authorization in application code

## Current Codebase Status

### ✅ What's Protected

- All user-data tables have RLS enabled
- RLS policies are defined for:
  - users
  - user_tips
  - user_daily_actions
  - user_badges
  - user_challenges
  - reflections
  - deep_thoughts
  - deep_thoughts_comments
  - survey_responses
  - survey_summary
  - daily_health_points
  - guide_visits

### ⚠️ Current Implementation Gap

**The application currently uses the service role key for most operations**, which bypasses RLS. This means:

1. RLS is enabled but not actively enforced
2. Application-level authorization is the primary protection
3. RLS serves as a safety net if code accidentally uses anon key

### 🔧 Recommended Next Steps

1. **Option A (Recommended)**: Keep current approach
   - Continue using service role key with explicit user filtering
   - RLS remains as defense-in-depth for future/accidental anon key usage
   - Simpler, no code changes needed

2. **Option B**: Migrate to anon key with RLS
   - Update all API routes to use anon key instead of service role
   - Ensure `set_auth0_context()` is called before queries
   - More secure, but requires code changes

## Testing RLS

To test if RLS is working:

```sql
-- Enable RLS on a test table
ALTER TABLE user_tips ENABLE ROW LEVEL SECURITY;

-- Set the auth0_id context
SELECT set_auth0_context('auth0|test-user-id');

-- Try to query - should only see your own data
SELECT * FROM user_tips;

-- Try to query another user's data - should return empty
SELECT * FROM user_tips WHERE user_id = 'other-user-uuid';
```

## Verifying RLS is Enabled

```sql
-- Check which tables have RLS enabled
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
  AND rowsecurity = true
ORDER BY tablename;
```

## Security Best Practices

1. **Always filter by user_id** in application code when using service role key
2. **Never trust user input** - always validate and sanitize
3. **Use parameterized queries** (Supabase does this automatically)
4. **Verify user authorization** before allowing operations
5. **Monitor for suspicious queries** in Supabase logs

## Future Improvements

- [ ] Migrate API routes to use anon key with RLS (Option B above)
- [ ] Add automated tests for RLS policies
- [ ] Add monitoring/alerting for RLS policy violations
- [ ] Consider using PostgREST's `db-anon-role` with custom authorization

## References

- [Supabase RLS Documentation](https://supabase.com/docs/guides/auth/row-level-security)
- [PostgreSQL RLS Documentation](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)
- Migration files:
  - `028_enable_row_level_security.sql` - Enables RLS and creates policies
  - `029_add_auth0_context_function.sql` - Helper function for setting context

