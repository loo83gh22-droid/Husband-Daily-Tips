-- Add birthday-specific planning_required actions
-- These actions are perfect for planning a spouse's birthday celebration
-- They require planning and are served the week before the birthday

INSERT INTO actions (name, description, category, theme, requirement_type, icon, benefit, health_point_value) VALUES
  (
    'Plan a Surprise Birthday Party',
    'Organize a surprise birthday party for your spouse. Coordinate with friends and family, choose a venue, plan the menu, and create a memorable celebration. Start planning at least a week in advance.',
    'Romance',
    'romance',
    'date_nights',
    '🎉',
    'Surprise parties show thoughtfulness and effort. Planning ahead demonstrates you care enough to coordinate something special. The joy on their face makes all the planning worth it.',
    3
  ),
  (
    'Book a Weekend Getaway',
    'Plan and book a weekend getaway for your spouse''s birthday. Choose a destination they''ll love, book accommodations, and plan activities. Give them something to look forward to.',
    'Romance',
    'romance',
    'date_nights',
    '✈️',
    'A weekend getaway creates lasting memories and shows you''re willing to invest time and effort. It''s a break from routine and a chance to reconnect in a new environment.',
    3
  ),
  (
    'Plan a Special Birthday Dinner',
    'Reserve a table at their favorite restaurant or plan an elaborate home-cooked meal. Consider dietary preferences, create a special menu, and set the mood with decorations and ambiance.',
    'Romance',
    'romance',
    'date_nights',
    '🍽️',
    'A special dinner shows you know their preferences and care about creating a memorable experience. The effort you put into planning demonstrates thoughtfulness.',
    2
  ),
  (
    'Organize a Birthday Experience',
    'Plan a unique experience they''ve always wanted to try—a cooking class, wine tasting, spa day, concert, or adventure activity. Book it in advance and surprise them.',
    'Romance',
    'romance',
    'date_nights',
    '🎁',
    'Experiences create memories that last longer than material gifts. Planning something they''ve wanted shows you listen and pay attention to their interests.',
    2
  ),
  (
    'Create a Birthday Scavenger Hunt',
    'Design a personalized scavenger hunt leading to their birthday gift or surprise. Include meaningful locations, inside jokes, and memories. Plan the route and clues in advance.',
    'Romance',
    'romance',
    'date_nights',
    '🗺️',
    'A scavenger hunt is creative, personal, and shows effort. It makes the birthday celebration interactive and memorable, demonstrating you put thought into making it special.',
    2
  ),
  (
    'Plan a Birthday Celebration with Friends',
    'Coordinate a birthday celebration with close friends. Organize a gathering, plan activities, and create an environment where your spouse feels celebrated and loved by their community.',
    'Partnership',
    'partnership',
    'date_nights',
    '👥',
    'Celebrating with friends shows you understand the importance of their social connections. Organizing it demonstrates partnership and support for their relationships.',
    2
  ),
  (
    'Arrange a Birthday Photo Shoot',
    'Book a professional photo shoot or plan a DIY session to capture beautiful moments. Coordinate outfits, location, and timing. Create lasting memories they can treasure.',
    'Romance',
    'romance',
    'date_nights',
    '📸',
    'A photo shoot creates tangible memories and shows you value capturing special moments together. The planning and coordination demonstrate thoughtfulness.',
    1
  ),
  (
    'Plan a Birthday Staycation',
    'Transform your home into a special retreat. Plan activities, meals, and relaxation time. Create an itinerary that makes staying home feel like a vacation.',
    'Romance',
    'romance',
    'date_nights',
    '🏠',
    'A staycation can be just as special as going away. The planning shows creativity and effort, and it demonstrates you can create memorable experiences without leaving home.',
    1
  )
ON CONFLICT DO NOTHING;

-- Mark all birthday actions as planning_required
UPDATE actions 
SET day_of_week_category = 'planning_required'
WHERE name IN (
  'Plan a Surprise Birthday Party',
  'Book a Weekend Getaway',
  'Plan a Special Birthday Dinner',
  'Organize a Birthday Experience',
  'Create a Birthday Scavenger Hunt',
  'Plan a Birthday Celebration with Friends',
  'Arrange a Birthday Photo Shoot',
  'Plan a Birthday Staycation'
);

COMMENT ON TABLE actions IS 'Actions table includes birthday-specific planning_required actions that are served the week before spouse birthday';

