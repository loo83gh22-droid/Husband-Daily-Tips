-- Remove expert/research language from action benefits
-- Make them sound more casual and relatable, like Old Spice tone

-- Update "Practice the 5:1 Ratio" benefit
UPDATE actions 
SET benefit = 'Healthy relationships need way more positive moments than negative ones. This ratio works. Try it.' 
WHERE name = 'Practice the 5:1 Ratio';

-- Update "Create a Love Map" benefit
UPDATE actions 
SET benefit = 'Knowing your partner''s inner world—what they care about, what stresses them, what makes them happy—is the foundation of real connection. Ask the questions. Get to know her.' 
WHERE name = 'Create a Love Map';

-- Update "Practice Turning Toward" benefit
UPDATE actions 
SET benefit = 'When she reaches out, how you respond is everything. Turn toward her, and you connect. Turn away, and you drift apart. Small responses, big impact.' 
WHERE name = 'Practice Turning Toward';

-- Update "Try The Gottman Card Decks App" benefit
UPDATE actions 
SET benefit = 'Good conversation starters that actually work. Sometimes you need help knowing what to ask. This app helps.' 
WHERE name = 'Try The Gottman Card Decks App';

-- Update "Play We're Not Really Strangers" benefit (if it exists)
UPDATE actions 
SET benefit = 'Relationship games create structured opportunities for deep connection. They help you have conversations you might not have otherwise.' 
WHERE name = 'Play We''re Not Really Strangers';

-- Update formal language in other action benefits
UPDATE actions 
SET benefit = 'Making her favorite meal shows you pay attention to what she likes. The effort shows you care.' 
WHERE name = 'Cook Her Favorite Meal';

UPDATE actions 
SET benefit = 'Taking full pet responsibility shows you get it. It gives her a real break and shows you''re a true partner.' 
WHERE name = 'Take Full Pet Responsibility for a Week';

UPDATE actions 
SET benefit = 'Shows you see them as an individual, not just a roommate. Thoughtful surprises rebuild romantic connection.' 
WHERE name = 'Plan a Surprise That Shows You Know Them';

UPDATE actions 
SET benefit = 'Shifts focus to what''s good. Listing gratitude helps you notice the good your partner brings daily.' 
WHERE name = 'Gratitude List';

UPDATE actions 
SET benefit = 'Gives your partner a break and shows you care. Handling responsibilities shows partnership and reduces their stress.' 
WHERE name = 'Handle a Responsibility';

UPDATE actions 
SET benefit = 'Prevents things from getting worse. Staying calm shows respect and consideration for your partner.' 
WHERE name = 'Stay Calm';

UPDATE actions 
SET benefit = 'Long walks create space for deep conversation. Extended time together without distractions builds intimacy and understanding.' 
WHERE name = 'Long Distance Walk';

