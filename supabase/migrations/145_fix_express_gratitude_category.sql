-- Fix category for "Express Gratitude" action
-- This action was incorrectly categorized as "Communication" but should be "Gratitude"
-- Description: "Tell your partner one specific thing you're grateful for about them today."

UPDATE actions
SET category = 'Gratitude',
    theme = 'gratitude'
WHERE name = 'Express Gratitude'
  AND description LIKE '%Tell your partner one specific thing you''re grateful for about them today%'
  AND category = 'Communication';

-- Verify the update
DO $$
DECLARE
    updated_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO updated_count
    FROM actions
    WHERE name = 'Express Gratitude'
      AND category = 'Gratitude'
      AND description LIKE '%Tell your partner one specific thing you''re grateful for about them today%';
    
    IF updated_count > 0 THEN
        RAISE NOTICE 'Successfully updated "Express Gratitude" action category from Communication to Gratitude';
    ELSE
        RAISE WARNING 'No actions found matching "Express Gratitude" with the expected description';
    END IF;
END $$;

