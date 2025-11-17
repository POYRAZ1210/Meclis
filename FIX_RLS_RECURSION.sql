-- ============================================
-- FIX INFINITE RECURSION IN RLS POLICIES
-- ============================================
-- The problem: Admin checks create infinite loops
-- Solution: Simplify RLS - admins use service_role (backend)
-- ============================================

-- --------------------------------------------
-- 1. FIX POLL_VOTES RLS (NO RECURSION)
-- --------------------------------------------

ALTER TABLE poll_votes ENABLE ROW LEVEL SECURITY;

-- Drop ALL existing policies
DROP POLICY IF EXISTS "Users can view all votes" ON poll_votes;
DROP POLICY IF EXISTS "Users can view own votes" ON poll_votes;
DROP POLICY IF EXISTS "Users can vote" ON poll_votes;
DROP POLICY IF EXISTS "Users can insert own votes" ON poll_votes;
DROP POLICY IF EXISTS "Users can update own votes" ON poll_votes;
DROP POLICY IF EXISTS "Users can delete own votes" ON poll_votes;
DROP POLICY IF EXISTS "Admins can view all votes" ON poll_votes;

-- SIMPLE POLICIES (NO RECURSION)
-- Users can ONLY see their own votes
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

-- NOTE: Admins will access ALL votes via backend API (service_role)
-- No admin policy needed here!

-- Add PRIMARY KEY for UPSERT (vote changing)
ALTER TABLE poll_votes DROP CONSTRAINT IF EXISTS poll_votes_pkey;
ALTER TABLE poll_votes DROP CONSTRAINT IF EXISTS poll_votes_poll_id_user_id_key;

ALTER TABLE poll_votes 
  ADD CONSTRAINT poll_votes_pkey 
  PRIMARY KEY (poll_id, user_id);

-- --------------------------------------------
-- 2. FIX PROFILES RLS (NO RECURSION)
-- --------------------------------------------

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Drop ALL existing policies
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can insert profiles" ON profiles;

-- SIMPLE POLICIES (NO RECURSION)
-- Users can ONLY view their own profile
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = user_id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = user_id);

-- NOTE: Admins will access ALL profiles via backend API (service_role)
-- No admin policy needed here!

-- --------------------------------------------
-- 3. ENSURE PROFILES AUTO-CREATION TRIGGER
-- --------------------------------------------

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

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

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- --------------------------------------------
-- 4. ENSURE CLASS COLUMNS EXIST
-- --------------------------------------------

ALTER TABLE profiles 
  ADD COLUMN IF NOT EXISTS class_name TEXT,
  ADD COLUMN IF NOT EXISTS student_no TEXT;

CREATE INDEX IF NOT EXISTS idx_profiles_class ON profiles(class_name);

-- --------------------------------------------
-- 5. VERIFICATION
-- --------------------------------------------

-- Check RLS is enabled
SELECT 
  tablename, 
  rowsecurity
FROM pg_tables 
WHERE tablename IN ('poll_votes', 'profiles');

-- Check policies (should be simple now)
SELECT 
  tablename,
  policyname,
  cmd
FROM pg_policies
WHERE tablename IN ('poll_votes', 'profiles')
ORDER BY tablename, policyname;

-- ============================================
-- DONE! Policies are now simple:
-- - Users: Can only see/update their own data
-- - Admins: Use backend API (service_role bypasses RLS)
-- - No infinite recursion!
-- ============================================
