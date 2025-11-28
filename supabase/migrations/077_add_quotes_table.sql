-- Create quotes table
CREATE TABLE IF NOT EXISTS quotes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  quote_text TEXT NOT NULL,
  author TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for random selection
CREATE INDEX IF NOT EXISTS idx_quotes_id ON quotes(id);

-- Insert quotes
INSERT INTO quotes (quote_text, author) VALUES
  ('It is not a lack of love, but a lack of friendship that makes unhappy marriages.', 'Friedrich Nietzsche'),
  ('I love being married. It''s so great to find that one special person you want to annoy for the rest of your life.', 'Rita Rudner'),
  ('Make sure you have date night even if it''s once in a blue moon because most of the time you''re just too tired and you''d actually prefer to sleep.', 'Chris Hemsworth'),
  ('A good marriage is like a casserole: only those responsible for it really know what goes into it.', NULL),
  ('A successful marriage requires falling in love many times, always with the same person.', 'Mignon McLaughlin'),
  ('There is no more lovely, friendly, and charming relationship, communion, or company than a good marriage.', 'Martin Luther'),
  ('Happy is the man who finds a true friend, and far happier is he who finds that true friend in his wife.', 'Franz Schubert'),
  ('A good marriage is one which allows for change and growth in the individuals and in the way they express their love.', 'Pearl S. Buck'),
  ('A good marriage is the union of two good forgivers.', 'Ruth Bell Graham'),
  ('A happy marriage is a long conversation which always seems too short.', 'André Maurois'),
  ('My most brilliant achievement was my ability to be able to persuade my wife to marry me.', 'Winston Churchill'),
  ('Marriage is an alliance entered into by a man who can''t sleep with the window shut, and a woman who can''t sleep with the window open.', 'George Bernard Shaw'),
  ('Marriage is more than finding the right person; it is being the right person.', NULL),
  ('It takes a big man to cry, but it takes a much bigger man to laugh at that man', 'Jack Handey'),
  ('It''s sad that a family can be torn apart by something as simple as a pack of wild dogs', 'Jack Handey');

