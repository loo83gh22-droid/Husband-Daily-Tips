-- Add user preference to show actions from all countries (not just their selected country)
-- This allows users who want to see both US and Canadian holiday actions to opt-in

ALTER TABLE users 
ADD COLUMN IF NOT EXISTS show_all_country_actions BOOLEAN DEFAULT FALSE;

COMMENT ON COLUMN users.show_all_country_actions IS 'If true, user will see actions from all countries (US and CA). If false, user only sees actions matching their country setting. Defaults to false.';

