-- Fix mutable search_path issue on update_updated_at_column function
-- Functions should have a fixed search_path to prevent search path manipulation attacks
-- 
-- The fix: Add SET search_path = '' to force fully qualified names
-- This prevents attackers from manipulating the search_path to execute malicious code

-- Recreate the function with a fixed search_path
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
    NEW.updated_at := pg_catalog.NOW();
    RETURN NEW;
END;
$$;

-- Note: By setting search_path = '', we force fully qualified names
-- The NOW() function is now explicitly referenced as pg_catalog.NOW()
-- This prevents search path manipulation attacks
-- 
-- This function is used by triggers on multiple tables to automatically
-- update the updated_at timestamp column when rows are modified

