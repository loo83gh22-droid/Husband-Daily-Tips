-- Add benefit/why field to actions table
-- This will be shown alongside the action to explain why it's valuable

ALTER TABLE actions ADD COLUMN IF NOT EXISTS benefit TEXT;

-- Update existing actions with brief, valuable context
-- Communication Actions
UPDATE actions SET benefit = 'Builds trust and makes your partner feel heard. Deep listening prevents misunderstandings and strengthens your emotional connection.' WHERE name = 'Active Listening Session';
UPDATE actions SET benefit = 'Creates a positive atmosphere and strengthens bonds. Gratitude shifts focus to what''s working in your relationship.' WHERE name = 'Express Gratitude';
UPDATE actions SET benefit = 'Shows emotional maturity and accountability. Sincere apologies repair trust and demonstrate respect for your partner''s feelings.' WHERE name = 'Apologize Sincerely';
UPDATE actions SET benefit = 'Shows you care about their day. Regular check-ins create emotional intimacy and prevent small issues from becoming big problems.' WHERE name = 'Daily Check-In';
UPDATE actions SET benefit = 'Creates emotional intimacy and vulnerability. Sharing feelings builds deeper connection and helps your partner understand you better.' WHERE name = 'Share Your Feelings';

-- Romance Actions
UPDATE actions SET benefit = 'Keeps the relationship exciting and shows thoughtfulness. Surprises remind your partner they''re important to you.' WHERE name = 'Plan a Surprise Date';
UPDATE actions SET benefit = 'Tangible expression of love your partner can keep. Handwritten notes are personal and meaningful in our digital age.' WHERE name = 'Write a Love Note';
UPDATE actions SET benefit = 'Quality time strengthens connection. Regular date nights keep romance alive and help you reconnect away from daily stress.' WHERE name = 'Date Night';
UPDATE actions SET benefit = 'Physical touch releases oxytocin (the bonding hormone). Regular affection maintains physical intimacy and emotional closeness.' WHERE name = 'Physical Affection';
UPDATE actions SET benefit = 'Boosts your partner''s confidence and makes them feel valued. Specific compliments are more meaningful than generic ones.' WHERE name = 'Compliment Your Partner';

-- Gratitude Actions
UPDATE actions SET benefit = 'Shifts focus to positives and cultivates appreciation. Listing gratitude helps you notice the good your partner brings daily.' WHERE name = 'Gratitude List';
UPDATE actions SET benefit = 'Acknowledges their efforts and prevents resentment. Recognizing contributions makes partners feel seen and appreciated.' WHERE name = 'Thank You for Chores';
UPDATE actions SET benefit = 'Validates their hard work and motivates continued effort. Recognition is a powerful relationship currency.' WHERE name = 'Appreciate Their Effort';
UPDATE actions SET benefit = 'Quick way to brighten their day. Texting shows you''re thinking of them even when apart.' WHERE name = 'Gratitude Text';
UPDATE actions SET benefit = 'Sets a positive tone for the day. Starting with appreciation creates a warm, connected atmosphere.' WHERE name = 'Morning Gratitude';

-- Partnership Actions
UPDATE actions SET benefit = 'Shows you''re a true partner, not just a roommate. Taking initiative prevents the mental load from falling on one person.' WHERE name = 'Take Over a Chore';
UPDATE actions SET benefit = 'Shows you''re invested in their happiness and success. Supporting goals creates a team mentality in your relationship.' WHERE name = 'Support Their Goal';
UPDATE actions SET benefit = 'Gives your partner a break and shows care. Handling responsibilities demonstrates partnership and reduces their stress.' WHERE name = 'Handle a Responsibility';
UPDATE actions SET benefit = 'Creates shared purpose and unity. Planning together strengthens teamwork and builds anticipation for shared experiences.' WHERE name = 'Plan Together';
UPDATE actions SET benefit = 'Prevents small tasks from becoming sources of resentment. Being proactive shows thoughtfulness and consideration.' WHERE name = 'Be Proactive';

-- Intimacy Actions
UPDATE actions SET benefit = 'Speaking their love language makes them feel deeply loved. Understanding and practicing love languages transforms relationships.' WHERE name = 'Love Language Practice';
UPDATE actions SET benefit = 'Uninterrupted time deepens connection. Quality time without distractions shows your partner they''re your priority.' WHERE name = 'Quality Time';
UPDATE actions SET benefit = 'Physical touch releases bonding hormones. Regular, non-sexual touch maintains intimacy and emotional connection.' WHERE name = 'Physical Touch';
UPDATE actions SET benefit = 'Actions speak louder than words. Acts of service show love through deeds, not just words.' WHERE name = 'Acts of Service';
UPDATE actions SET benefit = 'Words have power. Affirmations boost confidence and make your partner feel valued and appreciated.' WHERE name = 'Words of Affirmation';

-- Conflict Resolution Actions
UPDATE actions SET benefit = 'Prevents resentment from building. Healthy conflict resolution strengthens relationships instead of weakening them.' WHERE name = 'Resolve a Disagreement';
UPDATE actions SET benefit = 'Shows maturity and accountability. Taking responsibility prevents defensiveness and opens the door to resolution.' WHERE name = 'Take Responsibility';
UPDATE actions SET benefit = 'Turns conflict into collaboration. Finding common ground transforms disagreements into opportunities for growth.' WHERE name = 'Find Common Ground';
UPDATE actions SET benefit = 'Prevents escalation and shows respect. Staying calm demonstrates emotional control and consideration for your partner.' WHERE name = 'Stay Calm';
UPDATE actions SET benefit = 'Repairs trust and heals hurts. Making amends shows you''re committed to improving and learning from mistakes.' WHERE name = 'Apologize and Make Amends';

-- Outdoor Activities
UPDATE actions SET benefit = 'Nature reduces stress and promotes bonding. Hiking together creates shared experiences and deep conversations away from distractions.' WHERE name = 'Go for a Hike Together';
UPDATE actions SET benefit = 'Morning walks boost mood and set a positive tone. Starting the day together creates connection before life gets busy.' WHERE name = 'Morning Walk';
UPDATE actions SET benefit = 'Evening walks are perfect for processing the day. Walking together encourages open conversation and stress relief.' WHERE name = 'Evening Stroll';
UPDATE actions SET benefit = 'Adventure and playfulness keep relationships fun. Spontaneous activities create memorable moments and shared laughter.' WHERE name = 'Go Streaking (Alone Together)';
UPDATE actions SET benefit = 'Nature and food are a perfect combination. Picnics create intimate, relaxed settings for quality conversation and connection.' WHERE name = 'Picnic in Nature';
UPDATE actions SET benefit = 'Stargazing inspires wonder and perspective. Looking at the stars together creates quiet, meaningful moments of connection.' WHERE name = 'Stargazing Date';
UPDATE actions SET benefit = 'Exercise together is relationship-building. Bike rides combine physical activity with quality time and shared exploration.' WHERE name = 'Bike Ride Together';
UPDATE actions SET benefit = 'Beach days are naturally relaxing and fun. Water, sun, and sand create the perfect environment for unwinding together.' WHERE name = 'Beach Day';
UPDATE actions SET benefit = 'Camping strips away distractions and builds teamwork. Shared challenges and nature create lasting memories and stronger bonds.' WHERE name = 'Camping Trip';
UPDATE actions SET benefit = 'Capturing moments together creates lasting memories. Photography walks combine creativity, nature, and quality time.' WHERE name = 'Nature Photography Walk';

-- Adventure/Exploration Actions
UPDATE actions SET benefit = 'New experiences create shared memories. Exploring together keeps the relationship fresh and exciting.' WHERE name = 'Explore a New Place';
UPDATE actions SET benefit = 'Sunrises and sunsets inspire awe and gratitude. These moments create quiet, profound connection and perspective.' WHERE name = 'Sunrise or Sunset Watch';
UPDATE actions SET benefit = 'Exercise together strengthens both body and relationship. Outdoor workouts combine health, nature, and connection.' WHERE name = 'Outdoor Workout';
UPDATE actions SET benefit = 'Challenge and support each other. Rock climbing builds trust, communication, and shared achievement.' WHERE name = 'Rock Climbing';
UPDATE actions SET benefit = 'Water activities are naturally playful and bonding. Kayaking requires teamwork and creates fun, memorable experiences.' WHERE name = 'Kayaking or Canoeing';
UPDATE actions SET benefit = 'Adventure and problem-solving combined. Geocaching creates excitement, teamwork, and shared exploration of your area.' WHERE name = 'Geocaching Adventure';
UPDATE actions SET benefit = 'Play keeps relationships fun and light. Games create laughter, competition, and connection without pressure.' WHERE name = 'Outdoor Game Day';
UPDATE actions SET benefit = 'Scenic drives create relaxed conversation opportunities. Beautiful views provide natural conversation starters and shared appreciation.' WHERE name = 'Scenic Drive';
UPDATE actions SET benefit = 'Shared experiences create lasting memories. Events and concerts provide excitement, conversation topics, and connection.' WHERE name = 'Outdoor Concert or Event';
UPDATE actions SET benefit = 'Creating something together builds pride and teamwork. Gardening teaches patience and creates shared accomplishment.' WHERE name = 'Garden Together';

-- Active Together Actions
UPDATE actions SET benefit = 'Exercise together strengthens both health and relationship. Running together creates accountability, shared goals, and quality time.' WHERE name = 'Run Together';
UPDATE actions SET benefit = 'Yoga promotes mindfulness and connection. Practicing together creates calm, presence, and physical closeness.' WHERE name = 'Yoga in Nature';
UPDATE actions SET benefit = 'Water activities are naturally fun and playful. Swimming together combines exercise with relaxation and connection.' WHERE name = 'Swimming';
UPDATE actions SET benefit = 'Casual, fun activity for all fitness levels. Disc golf combines friendly competition with outdoor time and conversation.' WHERE name = 'Disc Golf';
UPDATE actions SET benefit = 'Challenges create growth and shared achievement. Difficult hikes build resilience, teamwork, and lasting memories.' WHERE name = 'Hiking Challenge';
UPDATE actions SET benefit = 'Sports create friendly competition and fun. Playing together keeps relationships playful and active.' WHERE name = 'Outdoor Sports';
UPDATE actions SET benefit = 'Long walks create space for deep conversation. Extended time together without distractions fosters intimacy and understanding.' WHERE name = 'Long Distance Walk';
UPDATE actions SET benefit = 'Meditation reduces stress and increases presence. Practicing together creates calm, connection, and emotional regulation.' WHERE name = 'Outdoor Meditation';
UPDATE actions SET benefit = 'Nature trails provide beautiful settings for exercise. Trail running combines physical challenge with natural beauty and connection.' WHERE name = 'Trail Running';
UPDATE actions SET benefit = 'Dancing is joyful, playful, and bonding. Moving together releases endorphins and creates fun, memorable moments.' WHERE name = 'Outdoor Dance';

-- Create a table to track daily actions (similar to user_tips but for actions)
CREATE TABLE IF NOT EXISTS user_daily_actions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  action_id UUID NOT NULL REFERENCES actions(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  favorited BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, action_id, date)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_daily_actions_user_id ON user_daily_actions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_daily_actions_date ON user_daily_actions(date);
CREATE INDEX IF NOT EXISTS idx_user_daily_actions_user_date ON user_daily_actions(user_id, date);

