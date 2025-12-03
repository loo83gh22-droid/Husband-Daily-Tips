-- Fix mutable search_path issue on set_auth0_context function
-- Functions should have a fixed search_path to prevent search path manipulation attacks
-- 
-- The fix: Add SET search_path = '' to force fully qualified names
-- This prevents attackers from manipulating the search_path to execute malicious code

-- Recreate the function with a fixed search_path
CREATE OR REPLACE FUNCTION set_auth0_context(auth0_id TEXT)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  PERFORM pg_catalog.set_config('app.auth0_id', auth0_id, false);
END;
$$;

-- Grant execute permission to anon and authenticated roles
GRANT EXECUTE ON FUNCTION set_auth0_context(TEXT) TO anon;
GRANT EXECUTE ON FUNCTION set_auth0_context(TEXT) TO authenticated;

-- Note: By setting search_path = '', we force fully qualified names
-- The set_config function is now explicitly referenced as pg_catalog.set_config
-- This prevents search path manipulation attacks

