-- Fix migration 011 issues
-- Run this in Supabase SQL Editor to fix the two failed checks

-- ============================================================================
-- FIX 1: Create daily_health_points table (if it doesn't exist)
-- ============================================================================

CREATE TABLE IF NOT EXISTS daily_health_points (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  points_earned INTEGER DEFAULT 0, -- Points earned from completing daily action this day (max 6)
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, date)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_daily_health_points_user_id ON daily_health_points(user_id);
CREATE INDEX IF NOT EXISTS idx_daily_health_points_date ON daily_health_points(date);
CREATE INDEX IF NOT EXISTS idx_daily_health_points_user_date ON daily_health_points(user_id, date);

-- Update trigger for updated_at
DROP TRIGGER IF EXISTS update_daily_health_points_updated_at ON daily_health_points;
CREATE TRIGGER update_daily_health_points_updated_at BEFORE UPDATE ON daily_health_points
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- FIX 2: Set all badge health_bonus to 0
-- ============================================================================

UPDATE badges SET health_bonus = 0 WHERE health_bonus > 0;

-- ============================================================================
-- VERIFY FIXES
-- ============================================================================

-- Check daily_health_points table exists
SELECT 
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.tables 
      WHERE table_name = 'daily_health_points'
    ) 
    THEN '✅ FIXED: daily_health_points table now exists'
    ELSE '❌ STILL MISSING: daily_health_points table'
  END AS fix_1_result;

-- Check all badges have health_bonus = 0
SELECT 
  CASE 
    WHEN COUNT(*) = 0 
    THEN '✅ FIXED: All badges now have health_bonus = 0'
    ELSE CONCAT('❌ STILL FAILED: ', COUNT(*), ' badges still have health_bonus > 0')
  END AS fix_2_result
FROM badges 
WHERE health_bonus > 0;

