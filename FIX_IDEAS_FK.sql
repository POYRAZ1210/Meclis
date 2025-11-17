-- ============================================
-- FIX: Change ideas foreign key from profiles to auth.users
-- ============================================

-- 1. Drop existing foreign key constraint
ALTER TABLE ideas 
DROP CONSTRAINT IF EXISTS ideas_author_id_fkey;

-- 2. Add new foreign key to auth.users instead of profiles
ALTER TABLE ideas 
ADD CONSTRAINT ideas_author_id_fkey 
FOREIGN KEY (author_id) 
REFERENCES auth.users(id) 
ON DELETE CASCADE;

-- 3. Verify the change
SELECT 
  tc.constraint_name, 
  tc.table_name, 
  kcu.column_name, 
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name 
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.table_name = 'ideas' AND tc.constraint_type = 'FOREIGN KEY';
