-- Fix mutable search_path issue on increment_category_preference function
-- Functions should have a fixed search_path to prevent search path manipulation attacks
-- 
-- The fix: Add SET search_path = '' to force fully qualified names
-- This prevents attackers from manipulating the search_path to execute malicious code

-- Recreate the function with a fixed search_path
CREATE OR REPLACE FUNCTION increment_category_preference(
  p_user_id UUID,
  p_category TEXT
)
RETURNS DECIMAL(3,1)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  current_weight DECIMAL(3,1);
  new_weight DECIMAL(3,1);
BEGIN
  -- Get current weight or default to 0
  SELECT pg_catalog.COALESCE(preference_weight, 0) INTO current_weight
  FROM public.user_category_preferences
  WHERE user_id = p_user_id AND category = p_category;
  
  -- Calculate new weight (add 0.5, cap at 3.0)
  new_weight := pg_catalog.LEAST(pg_catalog.COALESCE(current_weight, 0) + 0.5, 3.0);
  
  -- Upsert the preference
  INSERT INTO public.user_category_preferences (user_id, category, preference_weight, updated_at)
  VALUES (p_user_id, p_category, new_weight, pg_catalog.NOW())
  ON CONFLICT (user_id, category)
  DO UPDATE SET
    preference_weight = new_weight,
    updated_at = pg_catalog.NOW();
  
  RETURN new_weight;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION increment_category_preference(UUID, TEXT) TO authenticated;

-- Note: By setting search_path = '', we force fully qualified names
-- All table and function references are now explicitly qualified:
-- - public.user_category_preferences (table)
-- - pg_catalog.COALESCE, pg_catalog.LEAST, pg_catalog.NOW() (system functions)
-- This prevents search path manipulation attacks

