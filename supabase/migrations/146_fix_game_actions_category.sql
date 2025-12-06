-- Fix category for conversation/game actions that should be Reconnection, not Intimacy
-- These actions are about having conversations and reconnecting, not physical intimacy

-- 1. Play We're Not Really Strangers
UPDATE actions
SET category = 'Reconnection',
    theme = 'reconnection'
WHERE name = 'Play We''re Not Really Strangers'
  AND category = 'Intimacy';

-- 2. Try The Gottman Card Decks App
UPDATE actions
SET category = 'Reconnection',
    theme = 'reconnection'
WHERE name = 'Try The Gottman Card Decks App'
  AND category = 'Intimacy';

-- 3. Play TableTopics for Couples
UPDATE actions
SET category = 'Reconnection',
    theme = 'reconnection'
WHERE name = 'Play TableTopics for Couples'
  AND category = 'Intimacy';

-- Verify the updates
DO $$
DECLARE
    updated_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO updated_count
    FROM actions
    WHERE name IN ('Play We''re Not Really Strangers', 'Try The Gottman Card Decks App', 'Play TableTopics for Couples')
      AND category = 'Reconnection';
    
    IF updated_count = 3 THEN
        RAISE NOTICE 'Successfully updated all 3 game/conversation actions from Intimacy to Reconnection';
    ELSIF updated_count > 0 THEN
        RAISE WARNING 'Only updated % out of 3 actions. Some may not have been found or already had correct category.', updated_count;
    ELSE
        RAISE WARNING 'No actions were updated. They may not exist or already have the correct category.';
    END IF;
END $$;

