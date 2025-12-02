-- Add action-packed holiday planning_required actions for all US and Canadian statutory holidays
-- Actions are tailored to each holiday's nature (celebratory vs. solemn)
-- All actions show initiative and require planning ahead

-- ============================================
-- US STATUTORY HOLIDAYS
-- ============================================

-- Martin Luther King Jr. Day (3rd Monday in January)
INSERT INTO actions (name, description, category, theme, requirement_type, icon, benefit, health_point_value, country, day_of_week_category, seasonal_start_date, seasonal_end_date)
SELECT 
  'Plan a Day of Service Together',
  'Take initiative to plan a day of service in honor of Martin Luther King Jr. Day. Research volunteer opportunities, coordinate with organizations, and organize a meaningful day of giving back together.',
  'Partnership',
  'partnership',
  'date_nights',
  '🤝',
  'Planning a day of service shows leadership and shared values. Your initiative creates meaningful impact and strengthens your bond through shared purpose.',
  2,
  'US',
  'planning_required',
  NULL, -- Will be calculated dynamically (1 week before 3rd Monday in Jan)
  NULL
WHERE NOT EXISTS (SELECT 1 FROM actions WHERE name = 'Plan a Day of Service Together' AND country = 'US');

INSERT INTO actions (name, description, category, theme, requirement_type, icon, benefit, health_point_value, country, day_of_week_category, seasonal_start_date, seasonal_end_date)
SELECT 
  'Organize a Community Activity Together',
  'Take charge of organizing a community activity for MLK Day. Plan an event, coordinate with neighbors, or organize a neighborhood gathering that brings people together.',
  'Partnership',
  'partnership',
  'date_nights',
  '🏘️',
  'Organizing community activities shows leadership and care for others. Your initiative strengthens community bonds and demonstrates shared values.',
  2,
  'US',
  'planning_required',
  NULL,
  NULL
WHERE NOT EXISTS (SELECT 1 FROM actions WHERE name = 'Organize a Community Activity Together' AND country = 'US');

-- Presidents' Day / Washington's Birthday (3rd Monday in February)
INSERT INTO actions (name, description, category, theme, requirement_type, icon, benefit, health_point_value, country, day_of_week_category, seasonal_start_date, seasonal_end_date)
SELECT 
  'Plan a Historical Day Trip',
  'Take initiative to plan a historical day trip for Presidents'' Day. Research historical sites, plan the route, and create an educational and memorable experience together.',
  'Quality Time',
  'quality_time',
  'date_nights',
  '🏛️',
  'Planning a historical trip shows thoughtfulness and interest in learning together. Your initiative creates meaningful shared experiences.',
  2,
  'US',
  'planning_required',
  NULL, -- Will be calculated dynamically (1 week before 3rd Monday in Feb)
  NULL
WHERE NOT EXISTS (SELECT 1 FROM actions WHERE name = 'Plan a Historical Day Trip' AND country = 'US');

INSERT INTO actions (name, description, category, theme, requirement_type, icon, benefit, health_point_value, country, day_of_week_category, seasonal_start_date, seasonal_end_date)
SELECT 
  'Organize a Presidents'' Day Weekend Getaway',
  'Take full responsibility for planning a Presidents'' Day weekend getaway. Research destinations, book accommodations, and create an itinerary for a memorable long weekend.',
  'Quality Time',
  'quality_time',
  'date_nights',
  '✈️',
  'Planning a weekend getaway shows you''re proactive and willing to invest in quality time. Your initiative creates lasting memories.',
  3,
  'US',
  'planning_required',
  NULL,
  NULL
WHERE NOT EXISTS (SELECT 1 FROM actions WHERE name = 'Organize a Presidents'' Day Weekend Getaway' AND country = 'US');

-- Juneteenth (June 19)
INSERT INTO actions (name, description, category, theme, requirement_type, icon, benefit, health_point_value, country, day_of_week_category, seasonal_start_date, seasonal_end_date)
SELECT 
  'Plan a Juneteenth Celebration Together',
  'Take the lead in planning a Juneteenth celebration. Research local events, organize a gathering, or plan activities that honor the significance of the day. Show initiative by handling all the details.',
  'Partnership',
  'partnership',
  'date_nights',
  '🎉',
  'Planning a meaningful celebration shows respect for history and shared values. Your initiative creates a memorable and respectful observance.',
  2,
  'US',
  'planning_required',
  NULL, -- Will be set to June 12
  NULL  -- Will be set to June 19
WHERE NOT EXISTS (SELECT 1 FROM actions WHERE name = 'Plan a Juneteenth Celebration Together' AND country = 'US');

INSERT INTO actions (name, description, category, theme, requirement_type, icon, benefit, health_point_value, country, day_of_week_category, seasonal_start_date, seasonal_end_date)
SELECT 
  'Organize a Juneteenth Community Event',
  'Take initiative to organize a Juneteenth community event. Coordinate with neighbors, plan activities, and create a gathering that brings people together to honor the day.',
  'Partnership',
  'partnership',
  'date_nights',
  '🤝',
  'Organizing a community event shows leadership and care for your community. Your initiative strengthens bonds and demonstrates shared values.',
  2,
  'US',
  'planning_required',
  NULL,
  NULL
WHERE NOT EXISTS (SELECT 1 FROM actions WHERE name = 'Organize a Juneteenth Community Event' AND country = 'US');

-- Columbus Day (2nd Monday in October)
INSERT INTO actions (name, description, category, theme, requirement_type, icon, benefit, health_point_value, country, day_of_week_category, seasonal_start_date, seasonal_end_date)
SELECT 
  'Plan a Cultural Exploration Day',
  'Take initiative to plan a cultural exploration day for Columbus Day. Research museums, cultural sites, or events, and create an educational and enriching experience together.',
  'Quality Time',
  'quality_time',
  'date_nights',
  '🌍',
  'Planning a cultural day shows thoughtfulness and interest in learning together. Your initiative creates meaningful shared experiences.',
  2,
  'US',
  'planning_required',
  NULL, -- Will be calculated dynamically (1 week before 2nd Monday in Oct)
  NULL
WHERE NOT EXISTS (SELECT 1 FROM actions WHERE name = 'Plan a Cultural Exploration Day' AND country = 'US');

INSERT INTO actions (name, description, category, theme, requirement_type, icon, benefit, health_point_value, country, day_of_week_category, seasonal_start_date, seasonal_end_date)
SELECT 
  'Organize a Columbus Day Weekend Activity',
  'Take full responsibility for planning a Columbus Day weekend activity. Research options, make reservations, and create an itinerary for a memorable experience.',
  'Quality Time',
  'quality_time',
  'date_nights',
  '🗺️',
  'Planning weekend activities shows you''re proactive and thoughtful. Your initiative creates quality time together.',
  2,
  'US',
  'planning_required',
  NULL,
  NULL
WHERE NOT EXISTS (SELECT 1 FROM actions WHERE name = 'Organize a Columbus Day Weekend Activity' AND country = 'US');

-- Veterans Day (November 11) - SOLEMN: No parties, respectful actions only
INSERT INTO actions (name, description, category, theme, requirement_type, icon, benefit, health_point_value, country, day_of_week_category, seasonal_start_date, seasonal_end_date)
SELECT 
  'Plan a Dinner for a Veteran You Know',
  'Take initiative to plan a special dinner for a veteran in your life. Coordinate with them, plan the menu, and create a meaningful way to honor their service. Show leadership by organizing everything.',
  'Gratitude',
  'gratitude',
  'date_nights',
  '🇺🇸',
  'Planning a dinner for a veteran shows respect and gratitude. Your initiative demonstrates thoughtfulness and appreciation for service.',
  2,
  'US',
  'planning_required',
  NULL, -- Will be set to Nov 4
  NULL  -- Will be set to Nov 11
WHERE NOT EXISTS (SELECT 1 FROM actions WHERE name = 'Plan a Dinner for a Veteran You Know' AND country = 'US');

INSERT INTO actions (name, description, category, theme, requirement_type, icon, benefit, health_point_value, country, day_of_week_category, seasonal_start_date, seasonal_end_date)
SELECT 
  'Organize a Visit to a Veterans Memorial',
  'Take charge of organizing a visit to a veterans memorial or ceremony. Research locations, plan the day, and create a respectful way to honor those who served.',
  'Gratitude',
  'gratitude',
  'date_nights',
  '🕊️',
  'Organizing a memorial visit shows respect and thoughtfulness. Your initiative demonstrates appreciation and shared values.',
  2,
  'US',
  'planning_required',
  NULL,
  NULL
WHERE NOT EXISTS (SELECT 1 FROM actions WHERE name = 'Organize a Visit to a Veterans Memorial' AND country = 'US');

-- ============================================
-- CANADIAN STATUTORY HOLIDAYS
-- ============================================

-- Family Day (3rd Monday in February)
INSERT INTO actions (name, description, category, theme, requirement_type, icon, benefit, health_point_value, country, day_of_week_category, seasonal_start_date, seasonal_end_date)
SELECT 
  'Plan a Family Day Celebration',
  'Take the lead in planning a Family Day celebration. Organize activities, plan a gathering with extended family, or create special family time. Show initiative by handling all the details.',
  'Partnership',
  'partnership',
  'date_nights',
  '👨‍👩‍👧‍👦',
  'Planning a family celebration shows you value family connections. Your initiative strengthens family bonds and creates lasting memories.',
  2,
  'CA',
  'planning_required',
  NULL, -- Will be calculated dynamically (1 week before 3rd Monday in Feb)
  NULL
WHERE NOT EXISTS (SELECT 1 FROM actions WHERE name = 'Plan a Family Day Celebration' AND country = 'CA');

INSERT INTO actions (name, description, category, theme, requirement_type, icon, benefit, health_point_value, country, day_of_week_category, seasonal_start_date, seasonal_end_date)
SELECT 
  'Organize a Family Day Activity',
  'Take full responsibility for organizing a Family Day activity. Research options, plan the day, and create a memorable experience that brings the family together.',
  'Partnership',
  'partnership',
  'date_nights',
  '🎯',
  'Organizing family activities shows leadership and care for family relationships. Your initiative creates quality time together.',
  2,
  'CA',
  'planning_required',
  NULL,
  NULL
WHERE NOT EXISTS (SELECT 1 FROM actions WHERE name = 'Organize a Family Day Activity' AND country = 'CA');

-- Good Friday (Friday before Easter) - SOLEMN: Respectful actions only
INSERT INTO actions (name, description, category, theme, requirement_type, icon, benefit, health_point_value, country, day_of_week_category, seasonal_start_date, seasonal_end_date)
SELECT 
  'Plan a Quiet Reflective Day Together',
  'Take initiative to plan a quiet, reflective day for Good Friday. Plan activities that allow for reflection, such as a nature walk, visiting a place of significance, or spending quiet time together.',
  'Quality Time',
  'quality_time',
  'date_nights',
  '🕯️',
  'Planning a reflective day shows thoughtfulness and respect for the significance of the day. Your initiative creates meaningful quiet time together.',
  2,
  'CA',
  'planning_required',
  NULL, -- Will be calculated dynamically (1 week before Good Friday)
  NULL
WHERE NOT EXISTS (SELECT 1 FROM actions WHERE name = 'Plan a Quiet Reflective Day Together' AND country = 'CA');

INSERT INTO actions (name, description, category, theme, requirement_type, icon, benefit, health_point_value, country, day_of_week_category, seasonal_start_date, seasonal_end_date)
SELECT 
  'Organize a Meaningful Good Friday Activity',
  'Take charge of organizing a meaningful Good Friday activity. Research appropriate activities, plan the day, and create a respectful way to observe the day together.',
  'Quality Time',
  'quality_time',
  'date_nights',
  '🙏',
  'Organizing a meaningful activity shows respect and thoughtfulness. Your initiative demonstrates shared values and creates connection.',
  2,
  'CA',
  'planning_required',
  NULL,
  NULL
WHERE NOT EXISTS (SELECT 1 FROM actions WHERE name = 'Organize a Meaningful Good Friday Activity' AND country = 'CA');

-- National Day for Truth and Reconciliation (September 30) - SOLEMN: Respectful actions only
INSERT INTO actions (name, description, category, theme, requirement_type, icon, benefit, health_point_value, country, day_of_week_category, seasonal_start_date, seasonal_end_date)
SELECT 
  'Plan a Day of Learning and Reflection',
  'Take initiative to plan a day of learning and reflection for the National Day for Truth and Reconciliation. Research educational resources, plan activities, and create a meaningful way to observe the day together.',
  'Partnership',
  'partnership',
  'date_nights',
  '🟠',
  'Planning a day of learning shows respect and commitment to understanding. Your initiative demonstrates shared values and creates meaningful reflection.',
  2,
  'CA',
  'planning_required',
  NULL, -- Will be set to Sept 23
  NULL  -- Will be set to Sept 30
WHERE NOT EXISTS (SELECT 1 FROM actions WHERE name = 'Plan a Day of Learning and Reflection' AND country = 'CA');

INSERT INTO actions (name, description, category, theme, requirement_type, icon, benefit, health_point_value, country, day_of_week_category, seasonal_start_date, seasonal_end_date)
SELECT 
  'Organize Participation in Truth and Reconciliation Events',
  'Take charge of organizing participation in Truth and Reconciliation Day events. Research local events, plan attendance, and create a respectful way to observe the day together.',
  'Partnership',
  'partnership',
  'date_nights',
  '🤝',
  'Organizing participation in events shows respect and commitment. Your initiative demonstrates shared values and creates meaningful engagement.',
  2,
  'CA',
  'planning_required',
  NULL,
  NULL
WHERE NOT EXISTS (SELECT 1 FROM actions WHERE name = 'Organize Participation in Truth and Reconciliation Events' AND country = 'CA');

-- Remembrance Day (November 11) - SOLEMN: No parties, respectful actions only
INSERT INTO actions (name, description, category, theme, requirement_type, icon, benefit, health_point_value, country, day_of_week_category, seasonal_start_date, seasonal_end_date)
SELECT 
  'Plan a Dinner for a Veteran You Know',
  'Take initiative to plan a special dinner for a veteran in your life. Coordinate with them, plan the menu, and create a meaningful way to honor their service. Show leadership by organizing everything.',
  'Gratitude',
  'gratitude',
  'date_nights',
  '🇨🇦',
  'Planning a dinner for a veteran shows respect and gratitude. Your initiative demonstrates thoughtfulness and appreciation for service.',
  2,
  'CA',
  'planning_required',
  NULL, -- Will be set to Nov 4
  NULL  -- Will be set to Nov 11
WHERE NOT EXISTS (SELECT 1 FROM actions WHERE name = 'Plan a Dinner for a Veteran You Know' AND country = 'CA');

INSERT INTO actions (name, description, category, theme, requirement_type, icon, benefit, health_point_value, country, day_of_week_category, seasonal_start_date, seasonal_end_date)
SELECT 
  'Organize Attendance at a Remembrance Day Ceremony',
  'Take charge of organizing attendance at a Remembrance Day ceremony. Research local ceremonies, plan the day, and create a respectful way to honor those who served.',
  'Gratitude',
  'gratitude',
  'date_nights',
  '🕊️',
  'Organizing ceremony attendance shows respect and thoughtfulness. Your initiative demonstrates appreciation and shared values.',
  2,
  'CA',
  'planning_required',
  NULL,
  NULL
WHERE NOT EXISTS (SELECT 1 FROM actions WHERE name = 'Organize Attendance at a Remembrance Day Ceremony' AND country = 'CA');

COMMENT ON TABLE actions IS 'Actions table includes holiday-specific planning_required actions for all US and Canadian statutory holidays. Actions are tailored to each holiday''s nature (celebratory vs. solemn) and show initiative.';

