-- Fix mutable search_path issue on referral functions
-- Functions should have a fixed search_path to prevent search path manipulation attacks
-- 
-- The fix: Add SET search_path = '' to force fully qualified names
-- This prevents attackers from manipulating the search_path to execute malicious code

-- ============================================================================
-- STEP 1: Fix generate_referral_code function
-- ============================================================================
CREATE OR REPLACE FUNCTION generate_referral_code()
RETURNS TEXT
LANGUAGE plpgsql
SET search_path = ''
AS $$
DECLARE
  code TEXT;
  exists_check BOOLEAN;
BEGIN
  LOOP
    -- Generate a random 8-character alphanumeric code
    code := upper(substring(pg_catalog.md5(pg_catalog.random()::text || pg_catalog.clock_timestamp()::text) from 1 for 8));
    
    -- Check if code already exists
    SELECT EXISTS(SELECT 1 FROM public.users WHERE public.users.referral_code = code) INTO exists_check;
    
    -- Exit loop if code is unique
    EXIT WHEN NOT exists_check;
  END LOOP;
  
  RETURN code;
END;
$$;

-- ============================================================================
-- STEP 2: Fix assign_referral_code function
-- ============================================================================
CREATE OR REPLACE FUNCTION assign_referral_code()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
  -- Only assign if referral_code is not already set
  IF NEW.referral_code IS NULL THEN
    NEW.referral_code := public.generate_referral_code();
  END IF;
  RETURN NEW;
END;
$$;

-- Note: By setting search_path = '', we force fully qualified names
-- All table and function references are now explicitly qualified:
-- - public.users (table)
-- - pg_catalog.md5, pg_catalog.random, pg_catalog.clock_timestamp (system functions)
-- - generate_referral_code() (function in same schema, but still safe)
-- This prevents search path manipulation attacks

