-- Safe version: Drops triggers if they exist, then recreates them

-- Drop triggers if they exist
DROP TRIGGER IF EXISTS update_reflections_updated_at ON reflections;
DROP TRIGGER IF EXISTS update_deep_thoughts_updated_at ON deep_thoughts;
DROP TRIGGER IF EXISTS update_deep_thoughts_comments_updated_at ON deep_thoughts_comments;

-- Recreate triggers
CREATE TRIGGER update_reflections_updated_at BEFORE UPDATE ON reflections
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_deep_thoughts_updated_at BEFORE UPDATE ON deep_thoughts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_deep_thoughts_comments_updated_at BEFORE UPDATE ON deep_thoughts_comments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

