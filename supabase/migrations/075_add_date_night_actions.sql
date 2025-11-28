-- Add three new date night actions
-- These actions will count toward date night badges (1, 5, 10, 25)

INSERT INTO actions (name, description, category, theme, requirement_type, icon, benefit, health_point_value) VALUES
  (
    'Go Dancing',
    'Take your partner dancing. Whether it''s a dance class, a nightclub, or dancing in your living room, move together to music and have fun.',
    'Romance',
    'romance',
    'date_nights',
    '💃',
    'Dancing is playful, physical, and romantic. It gets you moving together, creates shared fun, and breaks routine. The physical connection and laughter strengthen your bond.',
    3
  ),
  (
    'Go For Beer & Wings',
    'Have a loose night out together. Go to a casual spot, order beer and wings (or your favorite casual food), relax, and talk a lot. Keep it simple and focused on connection.',
    'Romance',
    'romance',
    'date_nights',
    '🍺',
    'Casual date nights are just as valuable as fancy ones. Sometimes the best dates are the simple ones where you can relax, be yourselves, and have real conversations without pressure.',
    3
  ),
  (
    'Sign Up for a Couples Art Class Project',
    'Find a couples art class or workshop and sign up together. Whether it''s painting, pottery, or another creative project, create something together while learning something new.',
    'Romance',
    'romance',
    'date_nights',
    '🎨',
    'Learning something new together creates shared memories and accomplishment. Art classes are creative, fun, and give you something to talk about and remember. Plus, you''ll have a keepsake from your time together.',
    3
  );

-- These actions will automatically accrue to date night badges:
-- - Date Night Starter (1 date night)
-- - Date Night Builder (5 date nights)
-- - Date Night Expert (10 date nights)
-- - Date Night Master (25 date nights)
-- 
-- The badge system checks for actions with requirement_type = 'date_nights'
-- and counts them toward these badges when completed.

