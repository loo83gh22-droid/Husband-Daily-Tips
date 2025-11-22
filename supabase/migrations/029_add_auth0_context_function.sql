-- Create a function to set the auth0_id in the session context
-- This allows RLS policies to check the current user's auth0_id
-- 
-- NOTE: This is a helper function. Since we use Auth0 (not Supabase Auth),
-- we can't automatically set session variables. This function provides
-- a way to set it manually, but it requires being called before queries.
--
-- However, due to PostgREST limitations, this approach has limitations.
-- The recommended approach is to:
-- 1. Use application-level filtering (filter by user_id in WHERE clauses)
-- 2. Use service role key with explicit user_id checks in application code
-- 3. RLS policies serve as a defense-in-depth measure

-- Function to set auth0 context (for use via RPC)
CREATE OR REPLACE FUNCTION set_auth0_context(auth0_id TEXT)
RETURNS void AS $$
BEGIN
  PERFORM set_config('app.auth0_id', auth0_id, false);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to anon role
GRANT EXECUTE ON FUNCTION set_auth0_context(TEXT) TO anon;
GRANT EXECUTE ON FUNCTION set_auth0_context(TEXT) TO authenticated;

-- Note: Due to PostgREST's connection pooling, this function may not
-- persist the setting across requests. Application-level filtering
-- is still the primary security mechanism.

