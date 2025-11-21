-- Add new relationship actions: cooking, finances, cleaning, pets, family, games, intimacy
-- Migration 023

-- Cooking Together Actions (Reconnection/Quality Time theme)
INSERT INTO actions (name, description, category, theme, requirement_type, icon, benefit, display_order) VALUES
  ('Cook a Meal Together', 'Plan and prepare a meal together from start to finish. Work as a team in the kitchen.', 'Quality Time', 'reconnection', 'action_completion', '👨‍🍳', 'Cooking together builds teamwork, creates shared accomplishment, and provides quality time without distractions. It''s a practical way to connect while accomplishing something together.', 1),
  ('Try a New Recipe Together', 'Pick a recipe neither of you has tried and make it together. Experiment and have fun.', 'Quality Time', 'reconnection', 'action_completion', '🍳', 'Trying new things together keeps the relationship fresh and exciting. Shared challenges create bonding moments and fun memories.', 1),
  ('Cook Her Favorite Meal', 'Make her favorite dish from scratch. Put thought and effort into making it special.', 'Romance', 'romance', 'action_completion', '🍝', 'Making her favorite meal shows you pay attention to what she likes. The effort demonstrates care and thoughtfulness.', 1),
  ('Have a Cooking Date Night', 'Turn cooking into a date. Put on music, have a drink, and enjoy the process together.', 'Romance', 'romance', 'action_completion', '🍷', 'Cooking dates are intimate and fun. They combine quality time, teamwork, and romance in a relaxed, home setting.', 1);

-- Financial Communication Actions (Partnership theme)
INSERT INTO actions (name, description, category, theme, requirement_type, icon, benefit, display_order) VALUES
  ('Have a Complete Financial Conversation', 'Sit down and discuss all aspects of your finances: income, expenses, debts, savings, and goals. Be completely transparent.', 'Partnership', 'partnership', 'action_completion', '💰', 'Financial transparency builds trust and prevents money-related conflicts. Open conversations about money create financial partnership and shared goals.', 2),
  ('Review Your Budget Together', 'Go through your monthly budget line by line. Discuss what''s working and what needs adjustment.', 'Partnership', 'partnership', 'action_completion', '📊', 'Budget reviews ensure you''re on the same page financially. Regular check-ins prevent financial surprises and build financial teamwork.', 2),
  ('Set Financial Goals Together', 'Discuss and agree on short-term and long-term financial goals. Create a plan to achieve them together.', 'Partnership', 'partnership', 'action_completion', '🎯', 'Shared financial goals create unity and purpose. Working toward common objectives strengthens your partnership and reduces money stress.', 2),
  ('Discuss Money Values', 'Talk about your relationship with money, spending habits, and financial priorities. Understand each other''s money mindset.', 'Partnership', 'partnership', 'action_completion', '💭', 'Understanding each other''s money values prevents conflicts. Different money mindsets are normal—discussing them creates understanding and compromise.', 2);

-- Cleaning/Household Actions (Partnership theme)
INSERT INTO actions (name, description, category, theme, requirement_type, icon, benefit, display_order) VALUES
  ('Do a Deep Clean Together', 'Pick a room or area and deep clean it together. Make it a team effort, not a solo task.', 'Partnership', 'partnership', 'action_completion', '🧹', 'Cleaning together transforms a chore into quality time. Teamwork makes the work faster and more enjoyable, and you both benefit from the result.', 2),
  ('Tackle a Cleaning Project', 'Identify a cleaning task that''s been put off and do it together. Finish it completely.', 'Partnership', 'partnership', 'action_completion', '✨', 'Completing neglected tasks together prevents resentment. Shared accomplishment and a cleaner space benefit you both.', 2),
  ('Organize a Cluttered Space', 'Pick a messy area (closet, garage, office) and organize it together. Make decisions about what to keep, donate, or toss.', 'Partnership', 'partnership', 'action_completion', '📦', 'Organizing together requires communication and compromise. It''s a practical way to work as a team and create a more peaceful home environment.', 2),
  ('Create a Cleaning Schedule Together', 'Sit down and create a fair division of cleaning tasks. Make a schedule you both agree on and can stick to.', 'Partnership', 'partnership', 'action_completion', '📅', 'A shared cleaning schedule prevents the mental load from falling on one person. Fair division of labor is essential for partnership.', 2);

-- Pet Responsibility Actions (Partnership theme)
INSERT INTO actions (name, description, category, theme, requirement_type, icon, benefit, display_order) VALUES
  ('Take Full Pet Responsibility for a Week', 'Handle 100% of pet care for a week: feeding, walking, cleaning, vet appointments. Give her a complete break.', 'Partnership', 'partnership', 'action_completion', '🐕', 'Taking full pet responsibility shows you understand the mental load. It gives her a real break and demonstrates true partnership.', 2),
  ('Handle Pet Poop Patrol Completely', 'Take over all pet waste cleanup without being asked. Do it consistently and without complaint.', 'Partnership', 'partnership', 'action_completion', '💩', 'Pet cleanup is often the least favorite task. Taking it over completely shows you''re willing to handle the unglamorous parts of partnership.', 2),
  ('Research Pet Care Before Getting One', 'If considering a pet, do thorough research on care requirements, costs, and time commitment. Be realistic about responsibility.', 'Partnership', 'partnership', 'action_completion', '🔍', 'Pets are long-term commitments. Thorough research prevents regret and ensures you''re both prepared for the responsibility.', 2),
  ('Create a Pet Care Plan Together', 'If you have a pet, sit down and create a fair division of pet care tasks. Make sure it''s sustainable for both of you.', 'Partnership', 'partnership', 'action_completion', '📋', 'A clear pet care plan prevents one person from carrying all the responsibility. Fair division ensures the pet is truly a shared commitment.', 2);

-- Family Actions for Mom (Partnership/Romance theme)
INSERT INTO actions (name, description, category, theme, requirement_type, icon, benefit, display_order) VALUES
  ('Make Mom Breakfast in Bed', 'You and the kids prepare breakfast together and serve it to Mom in bed. Let her relax and be served.', 'Partnership', 'partnership', 'action_completion', '🍳', 'Breakfast in bed makes Mom feel special and appreciated. It''s a simple way to show love and give her a break from morning responsibilities.', 2),
  ('Write and Read a Poem About Her', 'Write a poem (or have the kids help) about Mom and read it to her. Make it personal and heartfelt.', 'Romance', 'romance', 'action_completion', '📝', 'A personal poem shows thoughtfulness and effort. It''s a unique way to express appreciation and make her feel deeply loved.', 1),
  ('Take the Kids Out So Mom Gets a Break', 'Take the kids out for several hours so Mom can have uninterrupted time alone. Handle everything—no calls or texts unless emergency.', 'Partnership', 'partnership', 'action_completion', '👨‍👧‍👦', 'Giving Mom real alone time is a gift. Uninterrupted breaks are rare for mothers—this shows you understand and value her need for rest.', 2),
  ('Plan a Family Activity for Mom', 'Plan something the whole family can do together that Mom will enjoy. Take the lead on planning and execution.', 'Partnership', 'partnership', 'action_completion', '🎉', 'Planning family activities takes mental load off Mom. When you take the lead, she can just enjoy the moment instead of managing everything.', 2),
  ('Create a Mom Appreciation Day', 'Designate a day where the family focuses on showing Mom appreciation. Plan activities, meals, and gestures that honor her.', 'Partnership', 'partnership', 'action_completion', '💐', 'A dedicated appreciation day makes Mom feel valued. It teaches kids to appreciate their mother and creates lasting family memories.', 2),
  ('Handle Bedtime Routine So Mom Can Relax', 'Take over the entire bedtime routine (baths, stories, tucking in) so Mom can have an evening to herself.', 'Partnership', 'partnership', 'action_completion', '🌙', 'Bedtime routines are often Mom''s responsibility. Taking over completely gives her precious evening time to recharge and relax.', 2);

-- Relationship Games Actions (Reconnection/Intimacy theme)
INSERT INTO actions (name, description, category, theme, requirement_type, icon, benefit, display_order) VALUES
  ('Play We''re Not Really Strangers', 'Play the relationship card game that encourages deep, meaningful conversations. Be open and vulnerable.', 'Intimacy', 'reconnection', 'action_completion', '🃏', 'Relationship games create structured opportunities for deep connection. They facilitate conversations you might not have otherwise.', 1),
  ('Try The Gottman Card Decks App', 'Use the Gottman Institute''s card deck app to have meaningful conversations. Explore questions about your relationship.', 'Intimacy', 'reconnection', 'action_completion', '📱', 'Research-based relationship tools provide proven conversation starters. The Gottman method is backed by decades of relationship research.', 1),
  ('Play TableTopics for Couples', 'Use conversation starter cards designed for couples. Answer questions honestly and listen to each other''s responses.', 'Intimacy', 'reconnection', 'action_completion', '💬', 'Structured conversation games remove pressure and create natural opportunities for connection. They''re fun and meaningful.', 1),
  ('Try The Adventure Challenge Couples Edition', 'Complete a scratch-off adventure from the couples edition. Do something new and fun together.', 'Romance', 'romance', 'action_completion', '🎲', 'Adventure challenges add spontaneity and fun to relationships. They create shared experiences and break routine.', 1),
  ('Play Intimacy Building Games', 'Try relationship-building games that encourage connection, communication, and intimacy. Be open to trying new things together.', 'Intimacy', 'intimacy', 'action_completion', '❤️', 'Intimacy games can deepen connection and add playfulness to your relationship. They create safe spaces for vulnerability and fun.', 1);

-- Sex and Intimacy Actions (Intimacy theme)
INSERT INTO actions (name, description, category, theme, requirement_type, icon, benefit, display_order) VALUES
  ('Initiate Physical Intimacy Without Pressure', 'Initiate physical intimacy in a way that feels loving and pressure-free. Focus on connection, not just the end goal.', 'Intimacy', 'intimacy', 'action_completion', '💕', 'Pressure-free initiation makes intimacy feel safe and enjoyable. When she feels no pressure, she''s more likely to want to connect.', 1),
  ('Have a Conversation About Intimacy', 'Talk openly about your intimacy needs, desires, and what feels good. Listen without defensiveness.', 'Intimacy', 'intimacy', 'action_completion', '💬', 'Open conversations about intimacy improve your sex life. Understanding each other''s needs and desires creates better physical connection.', 1),
  ('Focus on Her Pleasure', 'Make an intimate encounter entirely about her pleasure. Ask what she wants and follow through without expecting anything in return.', 'Intimacy', 'intimacy', 'action_completion', '🌹', 'Focusing on her pleasure shows you care about her satisfaction. Selfless giving in intimacy strengthens emotional and physical connection.', 1),
  ('Create Intimacy Without Sex', 'Spend time being physically intimate without the expectation of sex. Cuddle, touch, and connect without pressure.', 'Intimacy', 'intimacy', 'action_completion', '🤗', 'Non-sexual intimacy is essential for a healthy sex life. Removing pressure allows natural desire to develop and strengthens emotional bonds.', 1),
  ('Plan a Romantic Evening', 'Plan an evening focused on romance and connection. Set the mood, eliminate distractions, and focus on each other.', 'Intimacy', 'intimacy', 'action_completion', '🕯️', 'Romantic evenings create space for intimacy to flourish. Thoughtful planning shows you value physical connection and your partner.', 1),
  ('Learn About Her Body', 'Ask her to show you what feels good. Learn about her body and what brings her pleasure. Be curious and attentive.', 'Intimacy', 'intimacy', 'action_completion', '💖', 'Understanding her body improves intimacy for both of you. Being a good lover means knowing what actually feels good to her.', 1);

-- Create Badges for New Actions
-- Note: Using badge_type instead of category, and health_bonus instead of points based on existing schema

-- Cooking Together Badges
INSERT INTO badges (name, description, icon, badge_type, requirement_type, requirement_value, health_bonus) VALUES
  ('Kitchen Team', 'Cooked 3 meals together', '👨‍🍳', 'big_idea', 'action_completion', 3, 20),
  ('Culinary Couple', 'Cooked 10 meals together', '🍳', 'big_idea', 'action_completion', 10, 50),
  ('Master Chefs', 'Cooked 25 meals together', '👨‍🍳👩‍🍳', 'big_idea', 'action_completion', 25, 125);

-- Financial Communication Badges
INSERT INTO badges (name, description, icon, badge_type, requirement_type, requirement_value, health_bonus) VALUES
  ('Financial Partners', 'Had 3 complete financial conversations', '💰', 'big_idea', 'action_completion', 3, 25),
  ('Money Masters', 'Had 10 financial conversations', '💵', 'big_idea', 'action_completion', 10, 75),
  ('Financial Team', 'Had 25 financial conversations', '💎', 'big_idea', 'action_completion', 25, 200);

-- Cleaning Badges
INSERT INTO badges (name, description, icon, badge_type, requirement_type, requirement_value, health_bonus) VALUES
  ('Cleaning Crew', 'Completed 5 cleaning projects together', '🧹', 'big_idea', 'action_completion', 5, 30),
  ('Household Heroes', 'Completed 15 cleaning projects together', '✨', 'big_idea', 'action_completion', 15, 100),
  ('Clean Team', 'Completed 30 cleaning projects together', '🏠', 'big_idea', 'action_completion', 30, 250);

-- Pet Responsibility Badges
INSERT INTO badges (name, description, icon, badge_type, requirement_type, requirement_value, health_bonus) VALUES
  ('Pet Partner', 'Took full pet responsibility 3 times', '🐕', 'big_idea', 'action_completion', 3, 25),
  ('Pet Pro', 'Took full pet responsibility 10 times', '🐾', 'big_idea', 'action_completion', 10, 75),
  ('Pet Champion', 'Took full pet responsibility 25 times', '🐶', 'big_idea', 'action_completion', 25, 200);

-- Family Actions for Mom Badges
INSERT INTO badges (name, description, icon, badge_type, requirement_type, requirement_value, health_bonus) VALUES
  ('Mom Appreciator', 'Completed 5 family actions for Mom', '💐', 'big_idea', 'action_completion', 5, 35),
  ('Mom Champion', 'Completed 15 family actions for Mom', '👑', 'big_idea', 'action_completion', 15, 125),
  ('Super Dad', 'Completed 30 family actions for Mom', '🦸', 'big_idea', 'action_completion', 30, 300);

-- Relationship Games Badges
INSERT INTO badges (name, description, icon, badge_type, requirement_type, requirement_value, health_bonus) VALUES
  ('Game Player', 'Played 3 relationship games together', '🃏', 'big_idea', 'action_completion', 3, 25),
  ('Connection Master', 'Played 10 relationship games together', '💬', 'big_idea', 'action_completion', 10, 75),
  ('Relationship Gamer', 'Played 25 relationship games together', '🎲', 'big_idea', 'action_completion', 25, 200);

-- Intimacy Badges
INSERT INTO badges (name, description, icon, badge_type, requirement_type, requirement_value, health_bonus) VALUES
  ('Intimacy Builder', 'Completed 5 intimacy actions', '💕', 'big_idea', 'action_completion', 5, 35),
  ('Intimacy Master', 'Completed 15 intimacy actions', '❤️', 'big_idea', 'action_completion', 15, 125),
  ('Intimacy Champion', 'Completed 30 intimacy actions', '💖', 'big_idea', 'action_completion', 30, 300);

-- Note: Badges are linked to actions through requirement_type matching action requirement_type
-- The system will automatically award badges when users complete actions matching the requirement_type and count

