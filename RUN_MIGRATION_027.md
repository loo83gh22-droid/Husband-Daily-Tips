# How to Run Migration 027 - Update Challenge Descriptions

## Steps to Update Challenge Descriptions

1. **Open Supabase Dashboard**
   - Go to [supabase.com](https://supabase.com)
   - Log in to your account
   - Select your project

2. **Open SQL Editor**
   - Click on "SQL Editor" in the left sidebar
   - Click "New Query" (or select an existing query)

3. **Copy and Paste This SQL:**

```sql
-- Update challenge descriptions with new tone (Old Spice energy + HIMYM storytelling)
-- This updates existing challenges to match the new voice and tone

-- Communication Challenge
UPDATE challenges
SET description = '7 days. 7 chances to stop talking AT her and start talking WITH her. Real conversations, not surface-level stuff. The guy who listens? That''s the guy who wins. Let''s upgrade your conversation game.'
WHERE name = '7-Day Communication Challenge';

-- Roommate Syndrome Recovery Challenge
UPDATE challenges
SET description = 'Newsflash: You''re not roommates. You''re partners. But somewhere along the way, that got blurry. 7 days to rediscover what you two actually are. Daily actions to move from "Hey, did you pay the electric bill?" back to "Hey, I actually missed you today."'
WHERE name = '7-Day Roommate Syndrome Recovery';

-- Romance Challenge
UPDATE challenges
SET description = 'Remember when you used to actually try? Yeah, her too. 7 days of small moves that make big impressions. Romance isn''t dead—it just needs a daily dose of intentional action. Let''s bring the spark back, one gesture at a time.'
WHERE name = '7-Day Romance Challenge';

-- Verify the updates
SELECT name, description FROM challenges WHERE is_active = true ORDER BY name;
```

4. **Run the Query**
   - Click "Run" (or press Ctrl+Enter / Cmd+Enter)
   - You should see "Success. No rows returned" or a result showing the updated challenges

5. **Verify the Updates**
   - The SELECT statement at the end will show you the updated descriptions
   - You should see all three challenges with their new descriptions

## Expected Result

You should see:
- ✅ 3 challenges updated
- ✅ New descriptions with Old Spice energy + HIMYM storytelling
- ✅ Verification query showing the updated descriptions

## What This Does

This migration updates the `description` field for all three active challenges:
- **Communication Challenge**: New confident, direct tone
- **Roommate Syndrome Recovery**: New playful but real storytelling
- **Romance Challenge**: New self-aware humor with real talk

After running this, when users view challenges on the dashboard, they'll see the new voice immediately!

