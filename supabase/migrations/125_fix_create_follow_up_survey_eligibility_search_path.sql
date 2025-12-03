-- Fix mutable search_path issue on create_follow_up_survey_eligibility function
-- Functions should have a fixed search_path to prevent search path manipulation attacks
-- 
-- The fix: Add SET search_path = '' to force fully qualified names
-- This prevents attackers from manipulating the search_path to execute malicious code

-- Recreate the function with a fixed search_path
CREATE OR REPLACE FUNCTION create_follow_up_survey_eligibility()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
  -- Create 3-day survey eligibility (3 days after signup)
  INSERT INTO public.user_follow_up_surveys (user_id, survey_type, eligible_at)
  VALUES (NEW.id, 'day_3_feedback', NEW.created_at + INTERVAL '3 days')
  ON CONFLICT (user_id, survey_type) DO NOTHING;
  
  -- Create 7-day survey eligibility (7 days after signup)
  INSERT INTO public.user_follow_up_surveys (user_id, survey_type, eligible_at)
  VALUES (NEW.id, 'day_7_conversion', NEW.created_at + INTERVAL '7 days')
  ON CONFLICT (user_id, survey_type) DO NOTHING;
  
  RETURN NEW;
END;
$$;

-- Note: By setting search_path = '', we force fully qualified names
-- The user_follow_up_surveys table is now explicitly referenced as public.user_follow_up_surveys
-- This prevents search path manipulation attacks

