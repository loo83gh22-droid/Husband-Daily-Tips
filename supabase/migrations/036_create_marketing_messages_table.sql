-- Create marketing_messages table for quotes and value propositions
CREATE TABLE IF NOT EXISTS marketing_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  message TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('pricing', 'value', 'motivation', 'social_proof', 'urgency', 'conversion', 'cta')),
  context TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for efficient queries
CREATE INDEX IF NOT EXISTS idx_marketing_messages_category ON marketing_messages(category);
CREATE INDEX IF NOT EXISTS idx_marketing_messages_context ON marketing_messages(context);
CREATE INDEX IF NOT EXISTS idx_marketing_messages_active ON marketing_messages(is_active);

-- Insert pricing/value comparison messages
INSERT INTO marketing_messages (message, category, context, display_order) VALUES
  ('$7 a month. Less than $0.25 a day. A no-brainer to level up your biggest win.', 'pricing', 'subscription_page', 1),
  ('For the price of 1 large Starbucks coffee, you get a month of relationship wins.', 'pricing', 'subscription_page', 2),
  ('Less than the cost of 1 ProV1 golf ball per day. But this actually improves your game.', 'pricing', 'subscription_page', 3),
  ('$0.25 per day. That''s less than a gumball. But way more valuable.', 'pricing', 'subscription_page', 4),
  ('Skip one fast food meal this month. Get daily actions that actually matter.', 'pricing', 'subscription_page', 5),
  ('One less beer at the bar = One month of being a better husband.', 'pricing', 'subscription_page', 6),
  ('Cheaper than Netflix. More valuable than your gym membership you never use.', 'pricing', 'subscription_page', 7),
  ('$7/month. That''s what, two coffees? But this actually changes your life.', 'pricing', 'subscription_page', 8),
  ('Your biggest win deserves your biggest investment.', 'value', 'subscription_page', 10),
  ('Small daily actions. Massive relationship impact.', 'value', 'landing_page', 11),
  ('Better than therapy. Cheaper than divorce.', 'value', 'subscription_page', 12),
  ('5 minutes a day. A lifetime of better connection.', 'value', 'dashboard', 13),
  ('The only subscription that makes your marriage better.', 'value', 'landing_page', 14),
  ('Real actions. Real results. Real simple.', 'value', 'landing_page', 15),
  ('Stop guessing. Start winning.', 'value', 'dashboard', 16),
  ('Your relationship is worth more than $0.25 a day.', 'value', 'subscription_page', 17),
  ('You''re already here. You''re already trying. That''s what matters.', 'motivation', 'dashboard', 20),
  ('Every action counts. Every day matters.', 'motivation', 'dashboard', 21),
  ('Small steps. Big changes. You got this.', 'motivation', 'dashboard', 22),
  ('The best husbands aren''t born. They''re made. Daily.', 'motivation', 'landing_page', 23),
  ('Consistency beats perfection. Every single time.', 'motivation', 'dashboard', 24),
  ('One action today. One smile tomorrow. That''s the goal.', 'motivation', 'dashboard', 25),
  ('Join thousands of husbands leveling up their relationships.', 'social_proof', 'landing_page', 30),
  ('Real husbands. Real actions. Real results.', 'social_proof', 'landing_page', 31),
  ('You''re not alone. You''re part of something bigger.', 'social_proof', 'dashboard', 32),
  ('Your relationship doesn''t wait. Why should you?', 'urgency', 'subscription_page', 40),
  ('Start today. See results this week.', 'urgency', 'landing_page', 41),
  ('The best time to start was yesterday. The second best time is now.', 'urgency', 'subscription_page', 42),
  ('$0.25 per day to be a better husband. That''s it.', 'conversion', 'landing_page', 50),
  ('Skip the coffee. Upgrade your marriage.', 'conversion', 'social_post', 51),
  ('One ProV1 golf ball = One month of relationship wins. Easy choice.', 'conversion', 'social_post', 52),
  ('Your phone''s full of distractions. Make this one count.', 'conversion', 'landing_page', 53),
  ('Less than a gumball. More valuable than therapy.', 'conversion', 'banner', 54),
  ('$7/month. One less beer. One better marriage.', 'conversion', 'social_post', 55),
  ('The only subscription that makes your biggest win even bigger.', 'conversion', 'landing_page', 56),
  ('Stop scrolling. Start winning.', 'conversion', 'banner', 57),
  ('For the price of 1 Starbucks, get 30 days of better.', 'conversion', 'social_post', 58),
  ('Cheaper than Netflix. More valuable than your unused gym membership.', 'conversion', 'landing_page', 59),
  ('One fast food meal = One month of relationship improvement.', 'conversion', 'social_post', 60),
  ('$0.25 a day. That''s less than a parking meter. But way more valuable.', 'conversion', 'banner', 61),
  ('Your marriage is worth more than $7/month. But that''s all it costs.', 'conversion', 'landing_page', 62),
  ('Skip one impulse buy. Get 30 days of intentional action.', 'conversion', 'social_post', 63),
  ('Better than therapy. Cheaper than divorce. Smarter than waiting.', 'conversion', 'landing_page', 64),
  ('Ready to level up? Start your 7-day free trial.', 'cta', 'landing_page', 70),
  ('Join thousands of husbands who are already winning.', 'cta', 'landing_page', 71),
  ('7 days free. No credit card. No risk. Just results.', 'cta', 'banner', 72),
  ('Try it free. See the difference. Make it permanent.', 'cta', 'landing_page', 73),
  ('Start your free trial today. Your marriage will thank you tomorrow.', 'cta', 'social_post', 74),
  ('Be spontaneous... with a little help.', 'value', 'landing_page', 75),
  ('This is for fun with the benefit of a happier partner and a happier you.', 'value', 'landing_page', 76);

-- Function to update updated_at timestamp
CREATE TRIGGER update_marketing_messages_updated_at BEFORE UPDATE ON marketing_messages
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
