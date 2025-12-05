-- Add actions specifically designed for couples who are apart (long-distance relationships, travel, etc.)
-- These actions help maintain connection when physical presence isn't possible

INSERT INTO actions (name, description, category, theme, requirement_type, icon, benefit, health_point_value, day_of_week_category) VALUES
(
  'Plan a Virtual Date Night',
  'Plan and execute a virtual date night. Choose an activity you can do together over video call—cook the same meal, watch a movie simultaneously, play an online game, or just have a long conversation. Set a specific time, dress up if you want, and make it feel special.',
  'Romance',
  'romance',
  'romance_actions',
  '💻',
  'Virtual dates maintain connection and create shared experiences even when you''re apart. Planning shows you''re thinking about her and prioritizing your relationship despite distance.',
  2,
  'weekly_routine'
),
(
  'Send a Surprise Video Message',
  'Record a short video message telling her something specific you love about her, sharing a memory, or just saying you''re thinking of her. Send it at an unexpected time—not just when you''re already talking.',
  'Romance',
  'romance',
  'romance_actions',
  '📹',
  'Video messages feel more personal than text. Seeing your face and hearing your voice creates connection even when you can''t be together. The surprise element shows you''re thinking of her.',
  1,
  'weekly_routine'
),
(
  'Have a Video Call Just to Talk',
  'Schedule a video call with no agenda—just to talk and see each other. Put away distractions, make eye contact, and have a real conversation. Ask about her day, share yours, and just be present together.',
  'Communication',
  'communication',
  'communication_actions',
  '📞',
  'Regular video calls maintain emotional intimacy when you''re apart. Having no agenda creates space for natural conversation and connection. It shows you value time with her, not just information exchange.',
  1,
  'weekly_routine'
),
(
  'Cook the Same Meal Together Over Video',
  'Choose a recipe you both want to try, get the ingredients, and cook it together over video call. Share the experience, laugh at mistakes, and then eat together virtually. It creates a shared experience despite distance.',
  'Quality Time',
  'quality_time',
  'quality_time_actions',
  '🍳',
  'Cooking together creates connection and shared experience. Doing it over video makes it feel like you''re in the same kitchen. It''s an activity that requires focus and creates natural conversation.',
  2,
  'planning_required'
),
(
  'Watch a Movie Together Remotely',
  'Choose a movie you both want to watch, sync up the start time, and watch it together over video call. Share reactions, pause to discuss, and make it feel like you''re watching together in person.',
  'Quality Time',
  'quality_time',
  'quality_time_actions',
  '🎬',
  'Watching movies together is a classic date activity. Doing it remotely maintains that shared experience. It creates conversation topics and gives you something to do together even when apart.',
  1,
  'weekly_routine'
),
(
  'Send a Thoughtful Care Package',
  'Put together a care package with things she loves—favorite snacks, a book she mentioned, a handwritten note, or something that reminds her of you. Mail it with a note explaining why you chose each item.',
  'Romance',
  'romance',
  'romance_actions',
  '📦',
  'Physical gifts show thoughtfulness and effort. A care package demonstrates you know what she likes and you''re thinking about her. The surprise of receiving it creates a moment of connection.',
  2,
  'planning_required'
),
(
  'Plan a Future Visit Together',
  'Take initiative to plan your next visit. Research dates, look at flights or travel options, and present her with a few options. Show you''re thinking ahead and prioritizing time together.',
  'Partnership',
  'partnership',
  'partnership_actions',
  '✈️',
  'Planning future visits shows you''re committed to making time together happen. Taking initiative removes the burden from her and demonstrates you''re actively working to close the distance.',
  2,
  'planning_required'
),
(
  'Send a Good Morning or Good Night Message',
  'Send a thoughtful good morning or good night message. Make it specific—mention something you''re thinking about, something you appreciate, or something you''re looking forward to. Make it personal, not generic.',
  'Communication',
  'communication',
  'communication_actions',
  '🌅',
  'Regular check-ins maintain daily connection. Starting or ending the day with a thoughtful message shows you''re thinking of her and helps you stay connected to each other''s daily lives.',
  1,
  'weekly_routine'
),
(
  'Play an Online Game Together',
  'Find an online game you can play together—a board game app, a multiplayer game, or even something simple like Words With Friends. Make it a regular thing and have fun competing or collaborating.',
  'Quality Time',
  'quality_time',
  'quality_time_actions',
  '🎮',
  'Playing games together creates shared experiences and fun moments. It gives you something to do together that''s interactive and engaging. The competition or collaboration creates connection.',
  1,
  'weekly_routine'
),
(
  'Share Your Day Through Photos',
  'Throughout the day, send photos of things you''re seeing, doing, or thinking about. Share moments from your day so she feels included in your life even when you''re apart. Make it a visual conversation.',
  'Communication',
  'communication',
  'communication_actions',
  '📸',
  'Photos help her feel included in your daily life. Sharing moments visually creates connection and gives her a window into your world. It makes distance feel smaller.',
  1,
  'weekly_routine'
)
ON CONFLICT DO NOTHING;

-- Add comment
COMMENT ON TABLE actions IS 'Actions table includes long-distance relationship actions for couples who are apart, including virtual dates, video calls, and ways to maintain connection across distance.';

