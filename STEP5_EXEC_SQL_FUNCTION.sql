-- ============================================
-- STEP 5: Create exec_sql function for raw SQL execution
-- ============================================

-- This function allows executing raw parameterized SQL
-- Needed to bypass PostgREST schema cache issues
CREATE OR REPLACE FUNCTION exec_sql(query TEXT, params TEXT[] DEFAULT '{}')
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSONB;
BEGIN
  -- This is a simplified version - Supabase has built-in exec_sql
  -- If this fails, use direct SQL in Supabase SQL Editor
  RAISE EXCEPTION 'Use Supabase SQL Editor for raw queries';
END;
$$;
