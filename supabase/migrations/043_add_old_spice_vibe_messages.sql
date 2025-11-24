-- Add Old Spice-style confident, bold marketing messages
-- These add that confident, memorable, slightly playful vibe

-- Add bold, confident motivation messages
INSERT INTO marketing_messages (message, category, context, display_order) VALUES
  ('Look at you. Actually doing it. That''s the move.', 'motivation', 'dashboard', 26),
  ('You''re not just trying. You''re doing. Keep going.', 'motivation', 'dashboard', 27),
  ('That action? That''s the move. You''re welcome.', 'motivation', 'dashboard', 28),
  ('You''re becoming the husband you want to be. Daily.', 'motivation', 'landing_page', 29),
  ('Boom. That''s how legends are made. One action at a time.', 'motivation', 'dashboard', 30),
  ('Look at your marriage. Now back to you. Now back to your marriage. Your marriage is still your marriage. But you? You''re leveling up.', 'value', 'landing_page', 88),
  ('You''re not playing. You''re winning.', 'motivation', 'dashboard', 31),
  ('She notices. You feel it. That''s the move.', 'value', 'landing_page', 89),
  ('The husband you want to be? That''s you. Daily actions. Real results.', 'motivation', 'landing_page', 32),
  ('Consistency wins. You''re proof.', 'motivation', 'dashboard', 33)
ON CONFLICT DO NOTHING;

-- Add bold, confident conversion messages
INSERT INTO marketing_messages (message, category, context, display_order) VALUES
  ('Look at you. You''re here. You''re trying. That''s what matters. Now unlock everything.', 'conversion', 'banner', 65),
  ('You''re not just a husband. You''re THE husband. Act like it.', 'conversion', 'landing_page', 66),
  ('The man you want to be? That''s you. Daily actions. Real results.', 'conversion', 'landing_page', 67),
  ('Stop winging it. Start winning it. That''s the move.', 'conversion', 'banner', 68),
  ('Look at your phone. Now look at your marriage. Now back to your phone. Your phone is still a phone. But your marriage? That can be legendary.', 'conversion', 'landing_page', 69)
ON CONFLICT DO NOTHING;

-- Add bold CTA messages
INSERT INTO marketing_messages (message, category, context, display_order) VALUES
  ('Ready to become legendary? Start your 7-day free trial.', 'cta', 'landing_page', 75),
  ('Look at you. You''re here. You''re ready. Let''s do this.', 'cta', 'landing_page', 76),
  ('7 days free. No credit card. No BS. Just results. You''re welcome.', 'cta', 'banner', 77),
  ('The husband you want to be? That''s you. Start your free trial.', 'cta', 'landing_page', 78)
ON CONFLICT DO NOTHING;

