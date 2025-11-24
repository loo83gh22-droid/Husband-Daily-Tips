-- Add creative, accessible partnership actions that couples can do together
-- These actions focus on fun, collaborative projects that build teamwork
-- All actions count towards partnership badge completion

-- ============================================================================
-- CREATIVE PARTNERSHIP ACTIONS
-- ============================================================================

-- Building/Creative Projects (accessible to most people)
INSERT INTO actions (name, description, category, theme, requirement_type, icon, benefit, health_point_value)
SELECT 
  'Build a Birdhouse Together',
  'Get some basic materials (wood, nails, paint) and build a birdhouse together. Work as a team to design, build, and decorate it.',
  'Partnership',
  'partnership',
  'action_completion',
  '🐦',
  'Building something together creates shared accomplishment and teamwork. You''ll have a tangible reminder of working together as partners.',
  3
WHERE NOT EXISTS (SELECT 1 FROM actions WHERE name = 'Build a Birdhouse Together' AND theme = 'partnership');

INSERT INTO actions (name, description, category, theme, requirement_type, icon, benefit, health_point_value)
SELECT 
  'Plant a Garden Together',
  'Choose a spot and plant a small garden together. Pick seeds, prepare the soil, and plant them as a team. Commit to watering and caring for it together.',
  'Partnership',
  'partnership',
  'action_completion',
  '🌱',
  'Gardening together requires planning, shared responsibility, and patience. Watching something grow that you created together is deeply satisfying.',
  3
WHERE NOT EXISTS (SELECT 1 FROM actions WHERE name = 'Plant a Garden Together' AND theme = 'partnership');

INSERT INTO actions (name, description, category, theme, requirement_type, icon, benefit, health_point_value)
SELECT 
  'Assemble Furniture Together',
  'Pick a piece of furniture (IKEA, Amazon, or any flat-pack) and assemble it together. Read instructions, organize parts, and build as a team.',
  'Partnership',
  'partnership',
  'action_completion',
  '🪑',
  'Assembling furniture tests communication and teamwork. You''ll practice patience, following directions together, and celebrating when it''s done.',
  2
WHERE NOT EXISTS (SELECT 1 FROM actions WHERE name = 'Assemble Furniture Together' AND theme = 'partnership');

INSERT INTO actions (name, description, category, theme, requirement_type, icon, benefit, health_point_value)
SELECT 
  'Create a Photo Album Together',
  'Gather photos (digital or printed) and create a photo album or scrapbook together. Choose photos, arrange them, and add captions or memories.',
  'Partnership',
  'partnership',
  'action_completion',
  '📸',
  'Creating a photo album together is a walk down memory lane. It strengthens your bond by reliving happy moments and creating something beautiful together.',
  2
WHERE NOT EXISTS (SELECT 1 FROM actions WHERE name = 'Create a Photo Album Together' AND theme = 'partnership');

-- Cooking/Baking Projects
INSERT INTO actions (name, description, category, theme, requirement_type, icon, benefit, health_point_value)
SELECT 
  'Bake Something From Scratch Together',
  'Pick a recipe (bread, cookies, cake) and bake it together from scratch. Divide tasks, work together, and enjoy the results.',
  'Partnership',
  'partnership',
  'action_completion',
  '🍪',
  'Baking together requires coordination, following directions, and patience. Plus, you get to enjoy something delicious you made together.',
  2
WHERE NOT EXISTS (SELECT 1 FROM actions WHERE name = 'Bake Something From Scratch Together' AND theme = 'partnership');

INSERT INTO actions (name, description, category, theme, requirement_type, icon, benefit, health_point_value)
SELECT 
  'Plan and Cook a 3-Course Meal Together',
  'Plan a 3-course meal together, shop for ingredients, and cook it as a team. One person can handle appetizer, one main, and work together on dessert.',
  'Partnership',
  'partnership',
  'action_completion',
  '🍽️',
  'Planning and executing a multi-course meal together is a true partnership test. It requires communication, timing, and teamwork.',
  3
WHERE NOT EXISTS (SELECT 1 FROM actions WHERE name = 'Plan and Cook a 3-Course Meal Together' AND theme = 'partnership');

-- Home Improvement Projects
INSERT INTO actions (name, description, category, theme, requirement_type, icon, benefit, health_point_value)
SELECT 
  'Paint a Room Together',
  'Choose a room, pick colors together, prep the space, and paint it as a team. Divide the work and help each other finish.',
  'Partnership',
  'partnership',
  'action_completion',
  '🎨',
  'Painting a room together transforms your space and your partnership. It requires planning, coordination, and working through the messy parts together.',
  3
WHERE NOT EXISTS (SELECT 1 FROM actions WHERE name = 'Paint a Room Together' AND theme = 'partnership');

INSERT INTO actions (name, description, category, theme, requirement_type, icon, benefit, health_point_value)
SELECT 
  'Organize a Closet or Storage Space Together',
  'Pick a closet, garage, or storage area and organize it together. Sort items, decide what to keep/donate, and create an organized system.',
  'Partnership',
  'partnership',
  'action_completion',
  '📦',
  'Organizing together requires compromise and decision-making. You''ll create a more peaceful space and practice working through differences.',
  2
WHERE NOT EXISTS (SELECT 1 FROM actions WHERE name = 'Organize a Closet or Storage Space Together' AND theme = 'partnership');

-- Creative/Artistic Projects
INSERT INTO actions (name, description, category, theme, requirement_type, icon, benefit, health_point_value)
SELECT 
  'Create Art Together',
  'Get some art supplies (paint, canvas, markers, or even just paper and pencils) and create something together. Collaborate on one piece or create side-by-side.',
  'Partnership',
  'partnership',
  'action_completion',
  '🎨',
  'Creating art together is playful and bonding. There''s no pressure to be perfect—just enjoy the process of making something together.',
  2
WHERE NOT EXISTS (SELECT 1 FROM actions WHERE name = 'Create Art Together' AND theme = 'partnership');

INSERT INTO actions (name, description, category, theme, requirement_type, icon, benefit, health_point_value)
SELECT 
  'Build a Puzzle Together',
  'Get a jigsaw puzzle (500-1000 pieces) and work on it together over a few days or weeks. Set it up in a common area and work on it together.',
  'Partnership',
  'partnership',
  'action_completion',
  '🧩',
  'Puzzles require patience, communication, and teamwork. It''s a low-pressure way to spend quality time together and practice problem-solving as a team.',
  1
WHERE NOT EXISTS (SELECT 1 FROM actions WHERE name = 'Build a Puzzle Together' AND theme = 'partnership');

-- Planning/Organizing Projects
INSERT INTO actions (name, description, category, theme, requirement_type, icon, benefit, health_point_value)
SELECT 
  'Plan a Weekend Trip Together',
  'Research destinations, compare options, book accommodations, and plan activities together. Make all decisions as a team.',
  'Partnership',
  'partnership',
  'action_completion',
  '🗺️',
  'Planning a trip together requires compromise, communication, and shared decision-making. You''ll practice working together before you even leave.',
  3
WHERE NOT EXISTS (SELECT 1 FROM actions WHERE name = 'Plan a Weekend Trip Together' AND theme = 'partnership');

INSERT INTO actions (name, description, category, theme, requirement_type, icon, benefit, health_point_value)
SELECT 
  'Create a Vision Board Together',
  'Get magazines, scissors, glue, and a poster board. Cut out images and words that represent your shared goals and dreams. Create it together.',
  'Partnership',
  'partnership',
  'action_completion',
  '✨',
  'Creating a vision board together helps you align on goals and dreams. It''s a visual reminder of what you''re building together as partners.',
  2
WHERE NOT EXISTS (SELECT 1 FROM actions WHERE name = 'Create a Vision Board Together' AND theme = 'partnership');

-- Simple DIY Projects
INSERT INTO actions (name, description, category, theme, requirement_type, icon, benefit, health_point_value)
SELECT 
  'Build a Raised Garden Bed Together',
  'Build a simple raised garden bed using wood or cinder blocks. Work together to measure, cut, and assemble it.',
  'Partnership',
  'partnership',
  'action_completion',
  '🪴',
  'Building a garden bed is a practical project that benefits you both. It requires basic tools and teamwork, and you''ll enjoy the results for seasons to come.',
  3
WHERE NOT EXISTS (SELECT 1 FROM actions WHERE name = 'Build a Raised Garden Bed Together' AND theme = 'partnership');

INSERT INTO actions (name, description, category, theme, requirement_type, icon, benefit, health_point_value)
SELECT 
  'Make Homemade Gifts for Family Together',
  'Choose a family member or friend and create a homemade gift together. Could be baked goods, a craft, or something personalized.',
  'Partnership',
  'partnership',
  'action_completion',
  '🎁',
  'Creating gifts together combines creativity with thoughtfulness. You''ll practice working as a team while doing something kind for someone else.',
  2
WHERE NOT EXISTS (SELECT 1 FROM actions WHERE name = 'Make Homemade Gifts for Family Together' AND theme = 'partnership');

-- Tech/Organizational Projects
INSERT INTO actions (name, description, category, theme, requirement_type, icon, benefit, health_point_value)
SELECT 
  'Set Up a Home Organization System Together',
  'Choose an area (pantry, office, entryway) and create an organization system together. Buy or make organizers and set it up as a team.',
  'Partnership',
  'partnership',
  'action_completion',
  '📋',
  'Creating organization systems together ensures you both understand and use them. It''s practical partnership that makes daily life easier.',
  2
WHERE NOT EXISTS (SELECT 1 FROM actions WHERE name = 'Set Up a Home Organization System Together' AND theme = 'partnership');

INSERT INTO actions (name, description, category, theme, requirement_type, icon, benefit, health_point_value)
SELECT 
  'Create a Shared Playlist Together',
  'Sit down and create a playlist of songs that are meaningful to your relationship. Add songs that remind you of each other or special moments.',
  'Partnership',
  'partnership',
  'action_completion',
  '🎵',
  'Creating a playlist together is a fun, low-pressure way to connect. You''ll share music you love and create something you can enjoy together.',
  1
WHERE NOT EXISTS (SELECT 1 FROM actions WHERE name = 'Create a Shared Playlist Together' AND theme = 'partnership');

-- Outdoor/Seasonal Projects
INSERT INTO actions (name, description, category, theme, requirement_type, icon, benefit, health_point_value)
SELECT 
  'Build a Fire Pit or Outdoor Seating Area Together',
  'Plan and build a simple fire pit or outdoor seating area. Research, gather materials, and build it together.',
  'Partnership',
  'partnership',
  'action_completion',
  '🔥',
  'Building an outdoor space together creates a place for future quality time. It''s a project that keeps giving as you enjoy it together.',
  3
WHERE NOT EXISTS (SELECT 1 FROM actions WHERE name = 'Build a Fire Pit or Outdoor Seating Area Together' AND theme = 'partnership');

INSERT INTO actions (name, description, category, theme, requirement_type, icon, benefit, health_point_value)
SELECT 
  'Decorate for a Holiday Together',
  'Choose a holiday or season and decorate your home together. Plan the theme, shop for decorations, and set them up as a team.',
  'Partnership',
  'partnership',
  'action_completion',
  '🎄',
  'Decorating together is festive and fun. It requires planning and compromise, and you''ll both enjoy the results.',
  2
WHERE NOT EXISTS (SELECT 1 FROM actions WHERE name = 'Decorate for a Holiday Together' AND theme = 'partnership');

-- Simple Repair/Maintenance Projects
INSERT INTO actions (name, description, category, theme, requirement_type, icon, benefit, health_point_value)
SELECT 
  'Fix Something Broken Together',
  'Identify something that needs fixing (leaky faucet, squeaky door, loose handle) and fix it together. Research the solution and work on it as a team.',
  'Partnership',
  'partnership',
  'action_completion',
  '🔧',
  'Fixing things together saves money and builds confidence. You''ll practice problem-solving and celebrate when you solve it together.',
  2
WHERE NOT EXISTS (SELECT 1 FROM actions WHERE name = 'Fix Something Broken Together' AND theme = 'partnership');

-- Add comment explaining these are partnership-building actions
COMMENT ON TABLE actions IS 'Actions include partnership-building collaborative projects that count towards partnership badges when completed.';

