-- ============================================
-- CRITICAL BUG FIXES FOR MAYA MECLISI
-- ============================================
-- Run this SQL in Supabase SQL Editor
-- ============================================

-- --------------------------------------------
-- 1. FIX POLL_VOTES TABLE
-- --------------------------------------------

-- Drop existing primary key if any
ALTER TABLE poll_votes DROP CONSTRAINT IF EXISTS poll_votes_pkey;
ALTER TABLE poll_votes DROP CONSTRAINT IF EXISTS poll_votes_poll_id_user_id_key;

-- Add PRIMARY KEY (required for UPSERT to work)
ALTER TABLE poll_votes 
  ADD CONSTRAINT poll_votes_pkey 
  PRIMARY KEY (poll_id, user_id);

-- Enable RLS
ALTER TABLE poll_votes ENABLE ROW LEVEL SECURITY;

-- Drop old policies if they exist
DROP POLICY IF EXISTS "Users can view all votes" ON poll_votes;
DROP POLICY IF EXISTS "Users can vote" ON poll_votes;
DROP POLICY IF EXISTS "Users can update own votes" ON poll_votes;
DROP POLICY IF EXISTS "Users can delete own votes" ON poll_votes;

-- NEW POLICIES: Users can only see their own votes via client
CREATE POLICY "Users can view own votes"
  ON poll_votes FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own votes
CREATE POLICY "Users can insert own votes"
  ON poll_votes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own votes (for vote changing)
CREATE POLICY "Users can update own votes"
  ON poll_votes FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Admins can see all votes (for statistics)
CREATE POLICY "Admins can view all votes"
  ON poll_votes FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.user_id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- --------------------------------------------
-- 2. FIX PROFILES AUTO-CREATION
-- --------------------------------------------

-- Drop existing trigger if any
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Create function to auto-create profile
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, first_name, last_name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'role', 'student')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger on auth.users
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- --------------------------------------------
-- 3. ENSURE PROFILES TABLE HAS CLASS COLUMNS
-- --------------------------------------------

ALTER TABLE profiles 
  ADD COLUMN IF NOT EXISTS class_name TEXT,
  ADD COLUMN IF NOT EXISTS student_no TEXT;

-- Add index for performance
CREATE INDEX IF NOT EXISTS idx_profiles_class ON profiles(class_name);

-- --------------------------------------------
-- 4. FIX PROFILES RLS
-- --------------------------------------------

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Drop old policies
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON profiles;

-- Users can view their own profile
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = user_id);

-- Users can update their own profile (limited fields)
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = user_id);

-- Admins can view all profiles
CREATE POLICY "Admins can view all profiles"
  ON profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.user_id = auth.uid()
      AND p.role = 'admin'
    )
  );

-- Admins can update all profiles
CREATE POLICY "Admins can update all profiles"
  ON profiles FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.user_id = auth.uid()
      AND p.role = 'admin'
    )
  );

-- Admins can insert profiles (for user creation)
CREATE POLICY "Admins can insert profiles"
  ON profiles FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.user_id = auth.uid()
      AND p.role = 'admin'
    )
  );

-- --------------------------------------------
-- 5. VERIFICATION QUERIES
-- --------------------------------------------

-- Check poll_votes primary key
SELECT 
  tc.constraint_name, 
  tc.table_name, 
  kcu.column_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu 
  ON tc.constraint_name = kcu.constraint_name
WHERE tc.table_name = 'poll_votes' 
  AND tc.constraint_type = 'PRIMARY KEY';

-- Check RLS is enabled
SELECT 
  schemaname, 
  tablename, 
  rowsecurity
FROM pg_tables 
WHERE tablename IN ('poll_votes', 'profiles');

-- Check policies
SELECT 
  tablename,
  policyname,
  cmd
FROM pg_policies
WHERE tablename IN ('poll_votes', 'profiles')
ORDER BY tablename, policyname;

-- ============================================
-- DONE! Now test:
-- 1. Create 2 users from admin panel
-- 2. Login as User 1, vote on a poll
-- 3. Login as User 2, vote on same poll (should work!)
-- 4. Login as User 1 again, change vote (should work!)
-- 5. View statistics as admin (should work!)
-- ============================================
