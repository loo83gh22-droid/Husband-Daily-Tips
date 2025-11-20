-- Survey questions table
CREATE TABLE IF NOT EXISTS survey_questions (
  id INTEGER PRIMARY KEY,
  question_text TEXT NOT NULL,
  category TEXT NOT NULL, -- 'communication', 'romance', 'partnership', 'intimacy', 'conflict'
  response_type TEXT NOT NULL CHECK (response_type IN ('scale', 'yes_no')),
  order_index INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert 30 survey questions
-- Questions cover 5 categories: Communication, Romance, Partnership, Intimacy, Conflict
-- Mix of 1-5 scale questions and yes/no questions

-- Communication Questions (1-6)
INSERT INTO survey_questions (id, question_text, category, response_type, order_index) VALUES
(1, 'I feel comfortable expressing my feelings to my partner', 'communication', 'scale', 1),
(2, 'My partner and I have regular, meaningful conversations', 'communication', 'scale', 2),
(3, 'I actively listen when my partner is talking', 'communication', 'scale', 3),
(4, 'We resolve disagreements quickly and effectively', 'communication', 'scale', 4),
(5, 'I apologize when I make mistakes in our relationship', 'communication', 'yes_no', 5),
(6, 'We check in with each other about our relationship regularly', 'communication', 'yes_no', 6),

-- Romance Questions (7-12)
(7, 'I regularly plan romantic gestures or surprises for my partner', 'romance', 'scale', 7),
(8, 'We have regular date nights or quality time together', 'romance', 'scale', 8),
(9, 'I express my love and appreciation verbally', 'romance', 'scale', 9),
(10, 'I write notes or messages to show my partner I care', 'romance', 'yes_no', 10),
(11, 'We maintain physical affection in our daily routine', 'romance', 'scale', 11),
(12, 'I make an effort to keep the romance alive in our relationship', 'romance', 'scale', 12),

-- Partnership Questions (13-18)
(13, 'I contribute equally to household responsibilities', 'partnership', 'scale', 13),
(14, 'I take initiative on chores and tasks without being asked', 'partnership', 'scale', 14),
(15, 'I support my partner''s personal and professional goals', 'partnership', 'scale', 15),
(16, 'We make important decisions together', 'partnership', 'scale', 16),
(17, 'I handle my fair share of mental load and planning', 'partnership', 'yes_no', 17),
(18, 'I proactively notice what needs to be done around the house', 'partnership', 'yes_no', 18),

-- Intimacy Questions (19-24)
(19, 'We have a satisfying physical and emotional connection', 'intimacy', 'scale', 19),
(20, 'I understand and speak my partner''s love language', 'intimacy', 'scale', 20),
(21, 'We create time for intimacy and connection', 'intimacy', 'scale', 21),
(22, 'I feel emotionally close to my partner', 'intimacy', 'scale', 22),
(23, 'We prioritize each other over work or other commitments', 'intimacy', 'yes_no', 23),
(24, 'I make my partner feel valued and appreciated', 'intimacy', 'scale', 24),

-- Conflict Questions (25-30)
(25, 'We handle disagreements without yelling or disrespect', 'conflict', 'scale', 25),
(26, 'I can stay calm during arguments', 'conflict', 'scale', 26),
(27, 'We find solutions that work for both of us', 'conflict', 'scale', 27),
(28, 'I avoid bringing up past issues during current disagreements', 'conflict', 'yes_no', 28),
(29, 'We repair emotional damage after conflicts', 'conflict', 'yes_no', 29),
(30, 'I feel confident in our ability to work through problems together', 'conflict', 'scale', 30);

-- Create index for ordering
CREATE INDEX IF NOT EXISTS idx_survey_questions_order ON survey_questions(order_index);
CREATE INDEX IF NOT EXISTS idx_survey_questions_category ON survey_questions(category);

