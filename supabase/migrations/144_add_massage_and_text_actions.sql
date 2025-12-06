-- Add two new actions: massage and text wife actions

INSERT INTO actions (name, description, category, theme, requirement_type, icon, benefit, health_point_value, day_of_week_category) VALUES
(
  'Give Your Wife a Massage Tonight',
  'Give your wife a full-body or focused massage tonight. Take your time, use lotion or oil, focus on areas where she holds tension (neck, shoulders, back, feet). Make it about her relaxation and comfort, not about anything else.',
  'Intimacy',
  'romance',
  'romance_actions',
  '💆',
  'Massage shows physical care and attention. It relieves stress, creates intimacy, and demonstrates that you care about her physical comfort. It''s a powerful way to show love through touch.',
  2,
  'planning_required'
),
(
  'Text Your Wife RIGHT NOW',
  'Stop what you''re doing and send her a text right now. Tell her what you''re looking forward to with her when you see her tonight. Be specific and genuine—not generic.',
  'Communication',
  'communication',
  'communication_actions',
  '💬',
  'Sending a spontaneous text shows you''re thinking about her even when you''re apart. Sharing what you''re looking forward to creates anticipation and connection. It makes her feel wanted and valued.',
  1,
  'weekly_routine'
);

