-- Fix mutable search_path issue on get_user_id_from_auth0 function
-- Functions should have a fixed search_path to prevent search path manipulation attacks
-- 
-- The fix: Add SET search_path = '' to force fully qualified names
-- This prevents attackers from manipulating the search_path to execute malicious code

-- Recreate the function with a fixed search_path
CREATE OR REPLACE FUNCTION get_user_id_from_auth0(auth0_id_param TEXT)
RETURNS UUID
LANGUAGE sql
STABLE
SET search_path = ''
AS $$
  SELECT id FROM public.users WHERE public.users.auth0_id = auth0_id_param LIMIT 1;
$$;

-- Note: By setting search_path = '', we force fully qualified names
-- The users table is now explicitly referenced as public.users
-- This prevents search path manipulation attacks

