-- Add action-packed holiday planning_required actions
-- These actions show initiative and require planning ahead
-- They are served the week leading up to holidays (similar to birthday actions)

-- First, mark existing holiday actions as planning_required
UPDATE actions 
SET day_of_week_category = 'planning_required'
WHERE name IN (
  'Plan a Special US Thanksgiving Together',
  'Celebrate Independence Day Together',
  'Honor Memorial Day Together',
  'Enjoy a Labor Day Weekend Together',
  'Plan a Special Canadian Thanksgiving Together',
  'Celebrate Canada Day Together',
  'Enjoy Victoria Day Weekend Together',
  'Enjoy a Labour Day Weekend Together',
  'Plan a Surprise Valentine''s Day Date',
  'Put Together an Easter Egg Hunt for Your Wife/Partner',
  'Go Get a Real Christmas Tree Together',
  'Set Relationship Goals for the New Year Together'
)
AND day_of_week_category IS NULL;

-- Add new action-packed holiday actions that show initiative
-- These are more proactive and show the user taking charge

-- Canada Day Actions (showing initiative)
INSERT INTO actions (name, description, category, theme, requirement_type, icon, benefit, health_point_value, country, day_of_week_category, seasonal_start_date, seasonal_end_date)
SELECT 
  'Plan a Canada Day BBQ and Fireworks Viewing',
  'Take the lead in planning a Canada Day celebration. Organize a BBQ, invite friends or family, find the best fireworks viewing spot, and create a memorable day. Show initiative by handling all the details.',
  'Quality Time',
  'quality_time',
  'date_nights',
  '🇨🇦',
  'Taking charge of holiday planning shows leadership and thoughtfulness. Your initiative makes the celebration special and memorable.',
  3,
  'CA',
  'planning_required',
  NULL, -- Will be set to June 25
  NULL  -- Will be set to July 1
WHERE NOT EXISTS (SELECT 1 FROM actions WHERE name = 'Plan a Canada Day BBQ and Fireworks Viewing' AND country = 'CA');

INSERT INTO actions (name, description, category, theme, requirement_type, icon, benefit, health_point_value, country, day_of_week_category, seasonal_start_date, seasonal_end_date)
SELECT 
  'Organize a Canada Day Day Trip',
  'Research and plan a day trip for Canada Day. Find a destination, plan the route, pack a picnic, and create an adventure. Take full responsibility for making it happen.',
  'Quality Time',
  'quality_time',
  'date_nights',
  '🚗',
  'Planning a day trip shows you''re proactive and willing to create experiences. Your initiative makes holidays special.',
  3,
  'CA',
  'planning_required',
  NULL,
  NULL
WHERE NOT EXISTS (SELECT 1 FROM actions WHERE name = 'Organize a Canada Day Day Trip' AND country = 'CA');

INSERT INTO actions (name, description, category, theme, requirement_type, icon, benefit, health_point_value, country, day_of_week_category, seasonal_start_date, seasonal_end_date)
SELECT 
  'Host a Canada Day Gathering',
  'Take initiative to host a Canada Day gathering. Plan the menu, invite guests, decorate, and create a festive atmosphere. Show leadership by organizing everything.',
  'Partnership',
  'partnership',
  'date_nights',
  '🎉',
  'Hosting shows you''re willing to take on responsibility and create joy for others. Your initiative strengthens relationships.',
  2,
  'CA',
  'planning_required',
  NULL,
  NULL
WHERE NOT EXISTS (SELECT 1 FROM actions WHERE name = 'Host a Canada Day Gathering' AND country = 'CA');

-- US Independence Day Actions (showing initiative)
INSERT INTO actions (name, description, category, theme, requirement_type, icon, benefit, health_point_value, country, day_of_week_category, seasonal_start_date, seasonal_end_date)
SELECT 
  'Plan a 4th of July BBQ and Fireworks',
  'Take charge of planning a 4th of July celebration. Organize the BBQ, handle the menu, find the best fireworks viewing location, and create a memorable Independence Day. Show initiative by planning everything.',
  'Quality Time',
  'quality_time',
  'date_nights',
  '🇺🇸',
  'Taking the lead on holiday planning demonstrates leadership and care. Your initiative makes celebrations special.',
  3,
  'US',
  'planning_required',
  NULL, -- Will be set to July 1
  NULL  -- Will be set to July 4
WHERE NOT EXISTS (SELECT 1 FROM actions WHERE name = 'Plan a 4th of July BBQ and Fireworks' AND country = 'US');

INSERT INTO actions (name, description, category, theme, requirement_type, icon, benefit, health_point_value, country, day_of_week_category, seasonal_start_date, seasonal_end_date)
SELECT 
  'Organize a 4th of July Parade and Picnic',
  'Research local 4th of July parades, plan a picnic, and organize the day. Take full responsibility for creating a memorable Independence Day experience.',
  'Quality Time',
  'quality_time',
  'date_nights',
  '🎆',
  'Planning a full day of activities shows you''re proactive and thoughtful. Your initiative creates lasting memories.',
  3,
  'US',
  'planning_required',
  NULL,
  NULL
WHERE NOT EXISTS (SELECT 1 FROM actions WHERE name = 'Organize a 4th of July Parade and Picnic' AND country = 'US');

-- Thanksgiving Actions (showing initiative)
INSERT INTO actions (name, description, category, theme, requirement_type, icon, benefit, health_point_value, country, day_of_week_category, seasonal_start_date, seasonal_end_date)
SELECT 
  'Take Charge of Thanksgiving Planning',
  'Show initiative by taking full responsibility for Thanksgiving planning. Plan the menu, create a shopping list, coordinate with family, and handle all the details. Lead the effort to make it special.',
  'Partnership',
  'partnership',
  'date_nights',
  '🦃',
  'Taking charge of holiday planning shows leadership and partnership. Your initiative reduces stress and creates a memorable celebration.',
  3,
  'US',
  'planning_required',
  NULL, -- Will be calculated dynamically
  NULL
WHERE NOT EXISTS (SELECT 1 FROM actions WHERE name = 'Take Charge of Thanksgiving Planning' AND country = 'US');

INSERT INTO actions (name, description, category, theme, requirement_type, icon, benefit, health_point_value, country, day_of_week_category, seasonal_start_date, seasonal_end_date)
SELECT 
  'Plan and Host Thanksgiving Dinner',
  'Take full initiative to plan and host Thanksgiving dinner. Handle menu planning, grocery shopping, cooking schedule, and all preparations. Show leadership by organizing everything.',
  'Partnership',
  'partnership',
  'date_nights',
  '🍽️',
  'Hosting Thanksgiving shows you''re willing to take on significant responsibility. Your initiative creates a special celebration.',
  3,
  'US',
  'planning_required',
  NULL,
  NULL
WHERE NOT EXISTS (SELECT 1 FROM actions WHERE name = 'Plan and Host Thanksgiving Dinner' AND country = 'US');

-- Canadian Thanksgiving Actions
INSERT INTO actions (name, description, category, theme, requirement_type, icon, benefit, health_point_value, country, day_of_week_category, seasonal_start_date, seasonal_end_date)
SELECT 
  'Take Charge of Canadian Thanksgiving Planning',
  'Show initiative by taking full responsibility for Canadian Thanksgiving planning. Plan the menu, create a shopping list, coordinate with family, and handle all the details. Lead the effort.',
  'Partnership',
  'partnership',
  'date_nights',
  '🍁',
  'Taking charge of holiday planning shows leadership and partnership. Your initiative reduces stress and creates a memorable celebration.',
  3,
  'CA',
  'planning_required',
  NULL,
  NULL
WHERE NOT EXISTS (SELECT 1 FROM actions WHERE name = 'Take Charge of Canadian Thanksgiving Planning' AND country = 'CA');

-- Valentine's Day Actions (showing initiative)
INSERT INTO actions (name, description, category, theme, requirement_type, icon, benefit, health_point_value, country, day_of_week_category, seasonal_start_date, seasonal_end_date)
SELECT 
  'Plan a Surprise Valentine''s Day Experience',
  'Take full initiative to plan a surprise Valentine''s Day experience. Research options, make reservations, plan the day, and create a memorable celebration. Show leadership by handling everything.',
  'Romance',
  'romance',
  'date_nights',
  '💝',
  'Planning a surprise shows thoughtfulness and initiative. Taking charge demonstrates you care enough to create something special.',
  3,
  NULL,
  'planning_required',
  NULL, -- Will be set to Feb 1
  NULL  -- Will be set to Feb 14
WHERE NOT EXISTS (SELECT 1 FROM actions WHERE name = 'Plan a Surprise Valentine''s Day Experience');

-- Christmas Actions (showing initiative)
INSERT INTO actions (name, description, category, theme, requirement_type, icon, benefit, health_point_value, country, day_of_week_category, seasonal_start_date, seasonal_end_date)
SELECT 
  'Take Charge of Christmas Decorating',
  'Show initiative by taking full responsibility for Christmas decorating. Plan the theme, shop for decorations, set everything up, and create a festive atmosphere. Lead the effort.',
  'Partnership',
  'partnership',
  'date_nights',
  '🎄',
  'Taking charge of decorating shows you''re proactive and willing to create joy. Your initiative makes the holidays special.',
  2,
  NULL,
  'planning_required',
  NULL, -- Will be set to Nov 25
  NULL  -- Will be set to Dec 14
WHERE NOT EXISTS (SELECT 1 FROM actions WHERE name = 'Take Charge of Christmas Decorating');

INSERT INTO actions (name, description, category, theme, requirement_type, icon, benefit, health_point_value, country, day_of_week_category, seasonal_start_date, seasonal_end_date)
SELECT 
  'Plan a Special Christmas Eve or Day Celebration',
  'Take full initiative to plan a special Christmas celebration. Organize the menu, plan activities, coordinate with family, and handle all the details. Show leadership by making it happen.',
  'Partnership',
  'partnership',
  'date_nights',
  '🎅',
  'Planning a special celebration shows you''re thoughtful and proactive. Your initiative creates lasting holiday memories.',
  3,
  NULL,
  'planning_required',
  NULL,
  NULL
WHERE NOT EXISTS (SELECT 1 FROM actions WHERE name = 'Plan a Special Christmas Eve or Day Celebration');

-- New Year's Actions (showing initiative)
INSERT INTO actions (name, description, category, theme, requirement_type, icon, benefit, health_point_value, country, day_of_week_category, seasonal_start_date, seasonal_end_date)
SELECT 
  'Plan a New Year''s Eve Celebration',
  'Take full initiative to plan a memorable New Year''s Eve celebration. Research options, make reservations or plan a home celebration, organize activities, and create a special night. Show leadership.',
  'Romance',
  'romance',
  'date_nights',
  '🎊',
  'Planning New Year''s shows you''re proactive about creating special moments. Your initiative makes the transition meaningful.',
  3,
  NULL,
  'planning_required',
  NULL, -- Will be set to Dec 26
  NULL  -- Will be set to Jan 5
WHERE NOT EXISTS (SELECT 1 FROM actions WHERE name = 'Plan a New Year''s Eve Celebration');

-- Memorial Day Actions (US)
INSERT INTO actions (name, description, category, theme, requirement_type, icon, benefit, health_point_value, country, day_of_week_category, seasonal_start_date, seasonal_end_date)
SELECT 
  'Plan a Memorial Day Weekend Getaway',
  'Take initiative to plan a Memorial Day weekend getaway. Research destinations, book accommodations, plan activities, and create a memorable long weekend. Show leadership by organizing everything.',
  'Quality Time',
  'quality_time',
  'date_nights',
  '🏖️',
  'Planning a weekend getaway shows you''re proactive and thoughtful. Your initiative creates a special break from routine.',
  3,
  'US',
  'planning_required',
  NULL,
  NULL
WHERE NOT EXISTS (SELECT 1 FROM actions WHERE name = 'Plan a Memorial Day Weekend Getaway' AND country = 'US');

-- Labor Day Actions (US and CA)
INSERT INTO actions (name, description, category, theme, requirement_type, icon, benefit, health_point_value, country, day_of_week_category, seasonal_start_date, seasonal_end_date)
SELECT 
  'Plan a Labor Day Weekend Adventure',
  'Take full initiative to plan a Labor Day weekend adventure. Research activities, make reservations, plan the itinerary, and create a memorable long weekend. Show leadership.',
  'Quality Time',
  'quality_time',
  'date_nights',
  '🏕️',
  'Planning a weekend adventure shows you''re proactive and willing to create experiences. Your initiative makes holidays special.',
  3,
  'US',
  'planning_required',
  NULL,
  NULL
WHERE NOT EXISTS (SELECT 1 FROM actions WHERE name = 'Plan a Labor Day Weekend Adventure' AND country = 'US');

INSERT INTO actions (name, description, category, theme, requirement_type, icon, benefit, health_point_value, country, day_of_week_category, seasonal_start_date, seasonal_end_date)
SELECT 
  'Plan a Labour Day Weekend Adventure',
  'Take full initiative to plan a Labour Day weekend adventure. Research activities, make reservations, plan the itinerary, and create a memorable long weekend. Show leadership.',
  'Quality Time',
  'quality_time',
  'date_nights',
  '🏕️',
  'Planning a weekend adventure shows you''re proactive and willing to create experiences. Your initiative makes holidays special.',
  3,
  'CA',
  'planning_required',
  NULL,
  NULL
WHERE NOT EXISTS (SELECT 1 FROM actions WHERE name = 'Plan a Labour Day Weekend Adventure' AND country = 'CA');

-- Victoria Day Actions (CA)
INSERT INTO actions (name, description, category, theme, requirement_type, icon, benefit, health_point_value, country, day_of_week_category, seasonal_start_date, seasonal_end_date)
SELECT 
  'Plan a Victoria Day Weekend Celebration',
  'Take full initiative to plan a Victoria Day weekend celebration. Organize activities, plan a gathering or trip, and create a memorable long weekend. Show leadership by handling all the details.',
  'Quality Time',
  'quality_time',
  'date_nights',
  '👑',
  'Planning a weekend celebration shows you''re proactive and thoughtful. Your initiative makes the holiday special.',
  3,
  'CA',
  'planning_required',
  NULL,
  NULL
WHERE NOT EXISTS (SELECT 1 FROM actions WHERE name = 'Plan a Victoria Day Weekend Celebration' AND country = 'CA');

COMMENT ON TABLE actions IS 'Actions table includes holiday-specific planning_required actions that show initiative and are served the week before holidays';

