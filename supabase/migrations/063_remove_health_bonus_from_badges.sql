-- Remove health bonuses from badges
-- Badges are just awards and do NOT affect Husband Health score

-- Set all health_bonus values to 0 (keeping column for backward compatibility but making it ineffective)
UPDATE badges SET health_bonus = 0 WHERE health_bonus IS NOT NULL;

-- Add comment documenting that badges don't affect health
COMMENT ON COLUMN badges.health_bonus IS 'Deprecated: Badges no longer provide health bonuses. They are purely awards and do not affect Husband Health score. This column is kept for backward compatibility but all values are set to 0.';

COMMENT ON TABLE badges IS 'Badges are achievement awards. They do NOT affect Husband Health score. Badges celebrate milestones and accomplishments but are purely recognition-based.';

