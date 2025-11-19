-- Add favorited column to reflections table
ALTER TABLE reflections 
ADD COLUMN IF NOT EXISTS favorited BOOLEAN DEFAULT FALSE;

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_reflections_favorited ON reflections(user_id, favorited) WHERE favorited = TRUE;

