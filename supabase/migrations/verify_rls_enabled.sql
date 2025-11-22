-- Verification query to check if Row Level Security (RLS) is enabled
-- This shows all tables in the public schema that have RLS enabled
-- Run this after migration 028 to verify RLS is working correctly

-- View 1: Check which tables have RLS enabled
SELECT 
    tablename, 
    rowsecurity as "RLS Enabled"
FROM pg_tables 
WHERE schemaname = 'public' 
  AND rowsecurity = true
ORDER BY tablename;

-- View 2: See ALL tables and their RLS status (more comprehensive)
SELECT 
    tablename, 
    CASE 
        WHEN rowsecurity THEN '✅ Enabled'
        ELSE '❌ Disabled'
    END as "RLS Status"
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY tablename;

-- View 3: Count how many tables have RLS enabled
SELECT 
    COUNT(*) as "Tables with RLS Enabled",
    (SELECT COUNT(*) FROM pg_tables WHERE schemaname = 'public') as "Total Tables"
FROM pg_tables 
WHERE schemaname = 'public' 
  AND rowsecurity = true;

