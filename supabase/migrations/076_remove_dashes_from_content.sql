-- Remove dashes from actions, badges, and guides
-- This migration removes em dashes (—), en dashes (–), and regular hyphens (-) 
-- from action names, descriptions, benefits, badge names/descriptions, and guide content

-- STEP 1: Update actions table
-- Remove dashes from action names
UPDATE actions 
SET name = REPLACE(REPLACE(REPLACE(name, '—', ' '), '–', ' '), ' - ', ' ')
WHERE name LIKE '%—%' OR name LIKE '%–%' OR name LIKE '% - %';

-- Remove dashes from action descriptions
UPDATE actions 
SET description = REPLACE(REPLACE(REPLACE(description, '—', ' '), '–', ' '), ' - ', ' ')
WHERE description LIKE '%—%' OR description LIKE '%–%' OR description LIKE '% - %';

-- Remove dashes from action benefits
UPDATE actions 
SET benefit = REPLACE(REPLACE(REPLACE(benefit, '—', ' '), '–', ' '), ' - ', ' ')
WHERE benefit LIKE '%—%' OR benefit LIKE '%–%' OR benefit LIKE '% - %';

-- STEP 2: Update badges table
-- Remove dashes from badge names
UPDATE badges 
SET name = REPLACE(REPLACE(REPLACE(name, '—', ' '), '–', ' '), ' - ', ' ')
WHERE name LIKE '%—%' OR name LIKE '%–%' OR name LIKE '% - %';

-- Remove dashes from badge descriptions
UPDATE badges 
SET description = REPLACE(REPLACE(REPLACE(description, '—', ' '), '–', ' '), ' - ', ' ')
WHERE description LIKE '%—%' OR description LIKE '%–%' OR description LIKE '% - %';

-- STEP 3: Update guides table (if it exists)
-- Check if guides table exists and update if present
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'guides') THEN
        -- Remove dashes from guide titles
        EXECUTE 'UPDATE guides 
                 SET title = REPLACE(REPLACE(REPLACE(title, ''—'', '' ''), ''–'', '' ''), '' - '', '' '')
                 WHERE title LIKE ''%—%'' OR title LIKE ''%–%'' OR title LIKE ''% - %''';
        
        -- Remove dashes from guide content
        EXECUTE 'UPDATE guides 
                 SET content = REPLACE(REPLACE(REPLACE(content, ''—'', '' ''), ''–'', '' ''), '' - '', '' '')
                 WHERE content LIKE ''%—%'' OR content LIKE ''%–%'' OR content LIKE ''% - %''';
    END IF;
END $$;

-- STEP 4: Clean up any double spaces that may have been created
UPDATE actions 
SET name = REGEXP_REPLACE(name, '\s+', ' ', 'g'),
    description = REGEXP_REPLACE(description, '\s+', ' ', 'g'),
    benefit = REGEXP_REPLACE(benefit, '\s+', ' ', 'g')
WHERE name ~ '\s{2,}' OR description ~ '\s{2,}' OR benefit ~ '\s{2,}';

UPDATE badges 
SET name = REGEXP_REPLACE(name, '\s+', ' ', 'g'),
    description = REGEXP_REPLACE(description, '\s+', ' ', 'g')
WHERE name ~ '\s{2,}' OR description ~ '\s{2,}';

-- Clean up guides if they exist
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'guides') THEN
        EXECUTE 'UPDATE guides 
                 SET title = REGEXP_REPLACE(title, ''\s+'', '' '', ''g''),
                     content = REGEXP_REPLACE(content, ''\s+'', '' '', ''g'')
                 WHERE title ~ ''\s{2,}'' OR content ~ ''\s{2,}''';
    END IF;
END $$;

-- STEP 5: Trim any leading/trailing spaces
UPDATE actions 
SET name = TRIM(name),
    description = TRIM(description),
    benefit = TRIM(benefit);

UPDATE badges 
SET name = TRIM(name),
    description = TRIM(description);

-- Trim guides if they exist
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'guides') THEN
        EXECUTE 'UPDATE guides 
                 SET title = TRIM(title),
                     content = TRIM(content)';
    END IF;
END $$;

