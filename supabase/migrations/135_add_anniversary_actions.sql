-- Add wedding anniversary-specific planning_required actions
-- These actions are perfect for planning anniversary celebrations
-- They require planning and are served the week before the anniversary date

INSERT INTO actions (name, description, category, theme, requirement_type, icon, benefit, health_point_value) VALUES
  (
    'Plan a Romantic Anniversary Getaway',
    'Plan and book a romantic getaway to celebrate your anniversary. Choose a destination you both love, book accommodations, and plan activities that allow you to reconnect and celebrate your journey together. Start planning at least a week in advance.',
    'Romance',
    'romance',
    'date_nights',
    '💑',
    'A getaway creates space to focus on each other without daily distractions. Planning it shows thoughtfulness and investment in your relationship. The time away strengthens your bond and creates lasting memories.',
    3
  ),
  (
    'Recreate Your First Date',
    'Plan to recreate your first date together. Visit the same location, do the same activities, and relive those early moments. Add thoughtful touches that show how far you''ve come since then.',
    'Romance',
    'romance',
    'date_nights',
    '💕',
    'Recreating your first date is nostalgic and romantic. It reminds you both of why you fell in love and shows you remember the important moments. The thoughtfulness of recreating it demonstrates how much those memories mean to you.',
    3
  ),
  (
    'Plan an Anniversary Surprise Party',
    'Organize a surprise anniversary celebration with close friends and family. Coordinate with loved ones, choose a venue, plan the details, and create a memorable celebration of your relationship. Start planning at least two weeks in advance.',
    'Partnership',
    'partnership',
    'date_nights',
    '🎊',
    'A surprise party shows you value your relationship enough to celebrate it with others. The coordination and planning demonstrate thoughtfulness and effort. It creates a memorable celebration and shows your community supports your relationship.',
    3
  ),
  (
    'Write and Read Anniversary Vows',
    'Write new vows or letters to each other reflecting on your year together, your growth, and your commitment. Plan a special moment to read them to each other—over dinner, during a walk, or in a meaningful location.',
    'Romance',
    'romance',
    'date_nights',
    '💌',
    'Writing and sharing vows or letters creates deep emotional connection. It shows you reflect on your relationship and value your commitment. The vulnerability and thoughtfulness strengthen your bond and create a meaningful anniversary tradition.',
    2
  ),
  (
    'Plan an Anniversary Photo Session',
    'Book a professional photo session or plan a DIY shoot to capture your anniversary. Choose a meaningful location, coordinate outfits, and create beautiful photos that document this milestone in your relationship.',
    'Romance',
    'romance',
    'date_nights',
    '📷',
    'An anniversary photo session creates tangible memories you can treasure. The planning shows you value documenting your relationship journey. The photos become keepsakes that remind you of your commitment and love.',
    2
  )
ON CONFLICT DO NOTHING;

-- Mark all anniversary actions as planning_required
UPDATE actions 
SET day_of_week_category = 'planning_required'
WHERE name IN (
  'Plan a Romantic Anniversary Getaway',
  'Recreate Your First Date',
  'Plan an Anniversary Surprise Party',
  'Write and Read Anniversary Vows',
  'Plan an Anniversary Photo Session'
);

COMMENT ON TABLE actions IS 'Actions table includes anniversary-specific planning_required actions that are served the week before wedding anniversary date';

