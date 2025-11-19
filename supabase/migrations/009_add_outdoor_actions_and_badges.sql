-- Add 30 new outdoor/adventure actions and 30+ new badges
-- Focus on outdoor activities, hiking, walking, streaking (alone together), and adventure

-- ============================================================================
-- NEW OUTDOOR/ADVENTURE ACTIONS (30 total)
-- ============================================================================

-- Outdoor Activities Category (10 actions)
INSERT INTO actions (name, description, category, theme, requirement_type, icon) VALUES
  ('Go for a Hike Together', 'Plan and go on a hike with your partner. Explore nature together and disconnect from daily stress.', 'Outdoor Activities', 'outdoor', 'outdoor_actions', '⛰️'),
  ('Morning Walk', 'Start the day with a walk together, even if it''s just 15 minutes around the neighborhood.', 'Outdoor Activities', 'outdoor', 'walk_actions', '🚶'),
  ('Evening Stroll', 'Take a relaxing evening walk together. Use this time to connect and talk about your day.', 'Outdoor Activities', 'outdoor', 'walk_actions', '🌙'),
  ('Go Streaking (Alone Together)', 'Find a private outdoor spot and go streaking together - feel free and adventurous as a couple.', 'Outdoor Activities', 'outdoor', 'streaking_actions', '🌟'),
  ('Picnic in Nature', 'Pack a lunch and find a beautiful outdoor spot for a picnic together.', 'Outdoor Activities', 'outdoor', 'outdoor_actions', '🧺'),
  ('Stargazing Date', 'Find a spot away from city lights and spend time stargazing together. Bring blankets and hot drinks.', 'Outdoor Activities', 'outdoor', 'outdoor_actions', '⭐'),
  ('Bike Ride Together', 'Go on a bike ride together. Explore local trails or bike paths in your area.', 'Outdoor Activities', 'outdoor', 'outdoor_actions', '🚴'),
  ('Beach Day', 'Spend a day at the beach together - swim, walk along the shore, or just relax in the sun.', 'Outdoor Activities', 'outdoor', 'outdoor_actions', '🏖️'),
  ('Camping Trip', 'Plan and execute a camping trip together, even if it''s just in your backyard.', 'Outdoor Activities', 'outdoor', 'camping_actions', '⛺'),
  ('Nature Photography Walk', 'Take a walk with your phones/camera and capture beautiful moments in nature together.', 'Outdoor Activities', 'outdoor', 'outdoor_actions', '📸');

-- Adventure/Exploration Category (10 actions)
INSERT INTO actions (name, description, category, theme, requirement_type, icon) VALUES
  ('Explore a New Place', 'Visit a new park, trail, or outdoor area you haven''t been to before.', 'Adventure', 'adventure', 'adventure_actions', '🗺️'),
  ('Sunrise or Sunset Watch', 'Wake up early to watch the sunrise together, or find a spot to watch the sunset.', 'Adventure', 'adventure', 'adventure_actions', '🌅'),
  ('Outdoor Workout', 'Do an outdoor workout together - running, calisthenics, or yoga in the park.', 'Adventure', 'adventure', 'outdoor_actions', '💪'),
  ('Rock Climbing', 'Try rock climbing together, either at a climbing gym or outdoor climbing spot.', 'Adventure', 'adventure', 'adventure_actions', '🧗'),
  ('Kayaking or Canoeing', 'Rent kayaks or canoes and spend time on the water together.', 'Adventure', 'adventure', 'water_activities', '🛶'),
  ('Geocaching Adventure', 'Try geocaching together - use an app to find hidden treasures in your area.', 'Adventure', 'adventure', 'adventure_actions', '🗺️'),
  ('Outdoor Game Day', 'Play outdoor games together - frisbee, catch, badminton, or any activity you both enjoy.', 'Adventure', 'adventure', 'outdoor_actions', '🎾'),
  ('Scenic Drive', 'Take a scenic drive together to a beautiful lookout point or scenic route.', 'Adventure', 'adventure', 'adventure_actions', '🚗'),
  ('Outdoor Concert or Event', 'Attend an outdoor concert, festival, or community event together.', 'Adventure', 'adventure', 'adventure_actions', '🎵'),
  ('Garden Together', 'Work on a garden together, whether it''s planting flowers, vegetables, or maintaining your outdoor space.', 'Adventure', 'adventure', 'outdoor_actions', '🌻');

-- Active Together Category (10 actions)
INSERT INTO actions (name, description, category, theme, requirement_type, icon) VALUES
  ('Run Together', 'Go for a run together, even if you run at different paces - you can meet up at the end.', 'Active Together', 'active', 'run_actions', '🏃'),
  ('Yoga in Nature', 'Do a yoga session together outdoors - in your backyard, a park, or beach.', 'Active Together', 'active', 'outdoor_actions', '🧘'),
  ('Swimming', 'Go swimming together - at a pool, lake, or beach. Enjoy the water together.', 'Active Together', 'active', 'water_activities', '🏊'),
  ('Disc Golf', 'Try disc golf together at a local course. It''s fun, casual, and gets you moving outside.', 'Active Together', 'active', 'outdoor_actions', '🥏'),
  ('Hiking Challenge', 'Complete a challenging hike together - pick something that pushes you both a bit.', 'Active Together', 'active', 'hiking_actions', '⛰️'),
  ('Outdoor Sports', 'Play a sport together outside - tennis, basketball, volleyball, or any sport you both enjoy.', 'Active Together', 'active', 'sports_actions', '⚽'),
  ('Long Distance Walk', 'Take a longer walk together - aim for at least an hour and use it as quality time.', 'Active Together', 'active', 'walk_actions', '🚶‍♂️'),
  ('Outdoor Meditation', 'Find a quiet outdoor spot and meditate together, even if just for 10 minutes.', 'Active Together', 'active', 'outdoor_actions', '🧘‍♂️'),
  ('Trail Running', 'Go trail running together on a nature trail or hiking path.', 'Active Together', 'active', 'run_actions', '🏃‍♀️'),
  ('Outdoor Dance', 'Find an outdoor space and dance together - let loose and have fun in nature.', 'Active Together', 'active', 'outdoor_actions', '💃');

-- ============================================================================
-- NEW BADGES (40+ badges including simple, outdoor, and exciting ones)
-- ============================================================================

-- Simple 3-Day Consistency Badges (5 badges)
INSERT INTO badges (name, description, icon, badge_type, requirement_type, requirement_value, health_bonus)
SELECT 'Quick Start', 'Complete actions for 3 days straight', '🌱', 'consistency', 'streak_days', 3, 10
WHERE NOT EXISTS (
  SELECT 1 FROM badges WHERE name = 'Quick Start' AND requirement_type = 'streak_days' AND requirement_value = 3
);

INSERT INTO badges (name, description, icon, badge_type, requirement_type, requirement_value, health_bonus)
SELECT 'Three Day Warrior', 'Complete 3 actions in a row', '⭐', 'consistency', 'streak_days', 3, 10
WHERE NOT EXISTS (
  SELECT 1 FROM badges WHERE name = 'Three Day Warrior' AND requirement_type = 'streak_days' AND requirement_value = 3
);

INSERT INTO badges (name, description, icon, badge_type, requirement_type, requirement_value, health_bonus)
SELECT 'Consistent Companion', 'Complete actions for 3 consecutive days', '🎯', 'consistency', 'streak_days', 3, 10
WHERE NOT EXISTS (
  SELECT 1 FROM badges WHERE name = 'Consistent Companion' AND requirement_type = 'streak_days' AND requirement_value = 3
);

INSERT INTO badges (name, description, icon, badge_type, requirement_type, requirement_value, health_bonus)
SELECT 'Building Momentum', '3 days of action completion', '🔥', 'consistency', 'streak_days', 3, 10
WHERE NOT EXISTS (
  SELECT 1 FROM badges WHERE name = 'Building Momentum' AND requirement_type = 'streak_days' AND requirement_value = 3
);

INSERT INTO badges (name, description, icon, badge_type, requirement_type, requirement_value, health_bonus)
SELECT 'Habit Starter', 'Complete 3 days in a row', '💪', 'consistency', 'streak_days', 3, 10
WHERE NOT EXISTS (
  SELECT 1 FROM badges WHERE name = 'Habit Starter' AND requirement_type = 'streak_days' AND requirement_value = 3
);

-- Simple 5-Day Badges (3 badges)
INSERT INTO badges (name, description, icon, badge_type, requirement_type, requirement_value, health_bonus)
SELECT 'Five Day Champ', 'Complete actions for 5 days straight', '🏅', 'consistency', 'streak_days', 5, 15
WHERE NOT EXISTS (
  SELECT 1 FROM badges WHERE name = 'Five Day Champ' AND requirement_type = 'streak_days' AND requirement_value = 5
);

INSERT INTO badges (name, description, icon, badge_type, requirement_type, requirement_value, health_bonus)
SELECT 'Weekday Warrior', 'Complete actions for 5 consecutive days', '⚡', 'consistency', 'streak_days', 5, 15
WHERE NOT EXISTS (
  SELECT 1 FROM badges WHERE name = 'Weekday Warrior' AND requirement_type = 'streak_days' AND requirement_value = 5
);

-- Outdoor Activity Badges (10 badges)
INSERT INTO badges (name, description, icon, badge_type, requirement_type, requirement_value, health_bonus)
SELECT 'Nature Lover', 'Complete 5 outdoor activities together', '🌲', 'big_idea', 'outdoor_actions', 5, 30
WHERE NOT EXISTS (
  SELECT 1 FROM badges WHERE name = 'Nature Lover' AND requirement_type = 'outdoor_actions' AND requirement_value = 5
);

INSERT INTO badges (name, description, icon, badge_type, requirement_type, requirement_value, health_bonus)
SELECT 'Hiking Hero', 'Go on 3 hikes together', '⛰️', 'big_idea', 'hiking_actions', 3, 35
WHERE NOT EXISTS (
  SELECT 1 FROM badges WHERE name = 'Hiking Hero' AND requirement_type = 'hiking_actions' AND requirement_value = 3
);

INSERT INTO badges (name, description, icon, badge_type, requirement_type, requirement_value, health_bonus)
SELECT 'Trail Blazer', 'Complete 5 hiking adventures together', '🥾', 'big_idea', 'hiking_actions', 5, 45
WHERE NOT EXISTS (
  SELECT 1 FROM badges WHERE name = 'Trail Blazer' AND requirement_type = 'hiking_actions' AND requirement_value = 5
);

INSERT INTO badges (name, description, icon, badge_type, requirement_type, requirement_value, health_bonus)
SELECT 'Walking Duo', 'Go on 10 walks together', '🚶', 'big_idea', 'walk_actions', 10, 25
WHERE NOT EXISTS (
  SELECT 1 FROM badges WHERE name = 'Walking Duo' AND requirement_type = 'walk_actions' AND requirement_value = 10
);

INSERT INTO badges (name, description, icon, badge_type, requirement_type, requirement_value, health_bonus)
SELECT 'Streaking Stars', 'Go streaking together 3 times', '🌟', 'big_idea', 'streaking_actions', 3, 50
WHERE NOT EXISTS (
  SELECT 1 FROM badges WHERE name = 'Streaking Stars' AND requirement_type = 'streaking_actions' AND requirement_value = 3
);

INSERT INTO badges (name, description, icon, badge_type, requirement_type, requirement_value, health_bonus)
SELECT 'Adventure Seekers', 'Complete 5 adventure activities together', '🗺️', 'big_idea', 'adventure_actions', 5, 40
WHERE NOT EXISTS (
  SELECT 1 FROM badges WHERE name = 'Adventure Seekers' AND requirement_type = 'adventure_actions' AND requirement_value = 5
);

INSERT INTO badges (name, description, icon, badge_type, requirement_type, requirement_value, health_bonus)
SELECT 'Camping Couple', 'Go camping together 2 times', '⛺', 'big_idea', 'camping_actions', 2, 45
WHERE NOT EXISTS (
  SELECT 1 FROM badges WHERE name = 'Camping Couple' AND requirement_type = 'camping_actions' AND requirement_value = 2
);

INSERT INTO badges (name, description, icon, badge_type, requirement_type, requirement_value, health_bonus)
SELECT 'Water Lovers', 'Complete 3 water activities together', '💧', 'big_idea', 'water_activities', 3, 35
WHERE NOT EXISTS (
  SELECT 1 FROM badges WHERE name = 'Water Lovers' AND requirement_type = 'water_activities' AND requirement_value = 3
);

INSERT INTO badges (name, description, icon, badge_type, requirement_type, requirement_value, health_bonus)
SELECT 'Running Partners', 'Go running together 5 times', '🏃', 'big_idea', 'run_actions', 5, 30
WHERE NOT EXISTS (
  SELECT 1 FROM badges WHERE name = 'Running Partners' AND requirement_type = 'run_actions' AND requirement_value = 5
);

INSERT INTO badges (name, description, icon, badge_type, requirement_type, requirement_value, health_bonus)
SELECT 'Outdoor Enthusiasts', 'Complete 10 outdoor activities together', '🌳', 'big_idea', 'outdoor_actions', 10, 55
WHERE NOT EXISTS (
  SELECT 1 FROM badges WHERE name = 'Outdoor Enthusiasts' AND requirement_type = 'outdoor_actions' AND requirement_value = 10
);

-- Sports & Active Badges (5 badges)
INSERT INTO badges (name, description, icon, badge_type, requirement_type, requirement_value, health_bonus)
SELECT 'Active Couple', 'Complete 5 active/athletic activities together', '🏋️', 'big_idea', 'sports_actions', 5, 35
WHERE NOT EXISTS (
  SELECT 1 FROM badges WHERE name = 'Active Couple' AND requirement_type = 'sports_actions' AND requirement_value = 5
);

INSERT INTO badges (name, description, icon, badge_type, requirement_type, requirement_value, health_bonus)
SELECT 'Fitness Friends', 'Complete 10 active activities together', '💪', 'big_idea', 'sports_actions', 10, 50
WHERE NOT EXISTS (
  SELECT 1 FROM badges WHERE name = 'Fitness Friends' AND requirement_type = 'sports_actions' AND requirement_value = 10
);

-- Exciting/Achievement Badges (10+ badges)
INSERT INTO badges (name, description, icon, badge_type, requirement_type, requirement_value, health_bonus)
SELECT 'First Adventure', 'Complete your first adventure activity together', '🎉', 'big_idea', 'adventure_actions', 1, 20
WHERE NOT EXISTS (
  SELECT 1 FROM badges WHERE name = 'First Adventure' AND requirement_type = 'adventure_actions' AND requirement_value = 1
);

INSERT INTO badges (name, description, icon, badge_type, requirement_type, requirement_value, health_bonus)
SELECT 'Daredevil Duo', 'Complete 3 adventurous or daring activities together', '🔥', 'big_idea', 'adventure_actions', 3, 45
WHERE NOT EXISTS (
  SELECT 1 FROM badges WHERE name = 'Daredevil Duo' AND requirement_type = 'adventure_actions' AND requirement_value = 3
);

INSERT INTO badges (name, description, icon, badge_type, requirement_type, requirement_value, health_bonus)
SELECT 'Sunrise Chasers', 'Watch 5 sunrises or sunsets together', '🌅', 'big_idea', 'adventure_actions', 5, 40
WHERE NOT EXISTS (
  SELECT 1 FROM badges WHERE name = 'Sunrise Chasers' AND requirement_type = 'adventure_actions' AND requirement_value = 5
);

INSERT INTO badges (name, description, icon, badge_type, requirement_type, requirement_value, health_bonus)
SELECT 'Explorer Extraordinaire', 'Visit 5 new places together', '🗺️', 'big_idea', 'adventure_actions', 5, 50
WHERE NOT EXISTS (
  SELECT 1 FROM badges WHERE name = 'Explorer Extraordinaire' AND requirement_type = 'adventure_actions' AND requirement_value = 5
);

INSERT INTO badges (name, description, icon, badge_type, requirement_type, requirement_value, health_bonus)
SELECT 'Weekend Warriors', 'Complete actions for 10 consecutive weekends', '🎯', 'consistency', 'weekend_streak', 10, 40
WHERE NOT EXISTS (
  SELECT 1 FROM badges WHERE name = 'Weekend Warriors' AND requirement_type = 'weekend_streak' AND requirement_value = 10
);

INSERT INTO badges (name, description, icon, badge_type, requirement_type, requirement_value, health_bonus)
SELECT 'Action Accumulator', 'Complete 25 total actions', '📊', 'consistency', 'total_actions', 25, 20
WHERE NOT EXISTS (
  SELECT 1 FROM badges WHERE name = 'Action Accumulator' AND requirement_type = 'total_actions' AND requirement_value = 25
);

INSERT INTO badges (name, description, icon, badge_type, requirement_type, requirement_value, health_bonus)
SELECT 'Super Streaker', 'Complete actions for 21 days straight', '🔥', 'consistency', 'streak_days', 21, 35
WHERE NOT EXISTS (
  SELECT 1 FROM badges WHERE name = 'Super Streaker' AND requirement_type = 'streak_days' AND requirement_value = 21
);

INSERT INTO badges (name, description, icon, badge_type, requirement_type, requirement_value, health_bonus)
SELECT 'Double Century', 'Complete 200 total actions', '💯', 'consistency', 'total_actions', 200, 50
WHERE NOT EXISTS (
  SELECT 1 FROM badges WHERE name = 'Double Century' AND requirement_type = 'total_actions' AND requirement_value = 200
);

INSERT INTO badges (name, description, icon, badge_type, requirement_type, requirement_value, health_bonus)
SELECT 'Outdoor Master', 'Complete 20 outdoor activities together', '🏞️', 'big_idea', 'outdoor_actions', 20, 70
WHERE NOT EXISTS (
  SELECT 1 FROM badges WHERE name = 'Outdoor Master' AND requirement_type = 'outdoor_actions' AND requirement_value = 20
);

INSERT INTO badges (name, description, icon, badge_type, requirement_type, requirement_value, health_bonus)
SELECT 'Adventure Legends', 'Complete 10 adventure activities together', '⚔️', 'big_idea', 'adventure_actions', 10, 65
WHERE NOT EXISTS (
  SELECT 1 FROM badges WHERE name = 'Adventure Legends' AND requirement_type = 'adventure_actions' AND requirement_value = 10
);

-- Special Milestone Badges (5 badges)
INSERT INTO badges (name, description, icon, badge_type, requirement_type, requirement_value, health_bonus)
SELECT 'Habit Hero', 'Complete actions for 60 days straight', '👑', 'consistency', 'streak_days', 60, 80
WHERE NOT EXISTS (
  SELECT 1 FROM badges WHERE name = 'Habit Hero' AND requirement_type = 'streak_days' AND requirement_value = 60
);

INSERT INTO badges (name, description, icon, badge_type, requirement_type, requirement_value, health_bonus)
SELECT 'Consistency King', 'Complete actions for 45 days straight', '🎖️', 'consistency', 'streak_days', 45, 60
WHERE NOT EXISTS (
  SELECT 1 FROM badges WHERE name = 'Consistency King' AND requirement_type = 'streak_days' AND requirement_value = 45
);

INSERT INTO badges (name, description, icon, badge_type, requirement_type, requirement_value, health_bonus)
SELECT 'Action All-Star', 'Complete 150 total actions', '⭐', 'consistency', 'total_actions', 150, 40
WHERE NOT EXISTS (
  SELECT 1 FROM badges WHERE name = 'Action All-Star' AND requirement_type = 'total_actions' AND requirement_value = 150
);

INSERT INTO badges (name, description, icon, badge_type, requirement_type, requirement_value, health_bonus)
SELECT 'Outdoor Icon', 'Complete 30 outdoor activities together', '🏆', 'big_idea', 'outdoor_actions', 30, 85
WHERE NOT EXISTS (
  SELECT 1 FROM badges WHERE name = 'Outdoor Icon' AND requirement_type = 'outdoor_actions' AND requirement_value = 30
);

INSERT INTO badges (name, description, icon, badge_type, requirement_type, requirement_value, health_bonus)
SELECT 'Ultimate Explorer', 'Visit 10 new places together', '🌍', 'big_idea', 'adventure_actions', 10, 75
WHERE NOT EXISTS (
  SELECT 1 FROM badges WHERE name = 'Ultimate Explorer' AND requirement_type = 'adventure_actions' AND requirement_value = 10
);

-- Create indexes for new requirement types if needed (these may already exist)
CREATE INDEX IF NOT EXISTS idx_actions_outdoor ON actions(requirement_type) WHERE requirement_type IN ('outdoor_actions', 'walk_actions', 'hiking_actions', 'streaking_actions', 'adventure_actions', 'camping_actions', 'water_activities', 'run_actions', 'sports_actions');

