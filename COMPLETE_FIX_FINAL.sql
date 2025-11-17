-- ============================================
-- COMPLETE FIX - DELETE ALL POLICIES AND START FRESH
-- ============================================
-- This will DELETE ALL RLS policies and create SIMPLE ones
-- NO admin checks, NO recursion!
-- ============================================

-- --------------------------------------------
-- STEP 1: DELETE ALL EXISTING POLICIES
-- --------------------------------------------

-- Drop ALL policies on poll_votes
DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'poll_votes') LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON poll_votes';
    END LOOP;
END $$;

-- Drop ALL policies on profiles
DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'profiles') LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON profiles';
    END LOOP;
END $$;

-- --------------------------------------------
-- STEP 2: FIX POLL_VOTES TABLE
-- --------------------------------------------

-- Ensure PRIMARY KEY exists (for UPSERT / vote changing)
ALTER TABLE poll_votes DROP CONSTRAINT IF EXISTS poll_votes_pkey;
ALTER TABLE poll_votes DROP CONSTRAINT IF EXISTS poll_votes_poll_id_user_id_key;

ALTER TABLE poll_votes 
  ADD CONSTRAINT poll_votes_pkey 
  PRIMARY KEY (poll_id, user_id);

-- Enable RLS
ALTER TABLE poll_votes ENABLE ROW LEVEL SECURITY;

-- ONLY 3 SIMPLE POLICIES - NO ADMIN CHECKS!

-- 1. Users can see their own votes
CREATE POLICY "select_own_votes"
  ON poll_votes FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- 2. Users can insert their own votes
CREATE POLICY "insert_own_votes"
  ON poll_votes FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- 3. Users can update their own votes (vote changing!)
CREATE POLICY "update_own_votes"
  ON poll_votes FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- --------------------------------------------
-- STEP 3: FIX PROFILES TABLE
-- --------------------------------------------

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- ONLY 2 SIMPLE POLICIES - NO ADMIN CHECKS!

-- 1. Users can see their own profile
CREATE POLICY "select_own_profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- 2. Users can update their own profile
CREATE POLICY "update_own_profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- --------------------------------------------
-- STEP 4: ENSURE PROFILES AUTO-CREATION
-- --------------------------------------------

-- Drop existing trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Create function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, first_name, last_name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'role', 'student')
  );
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Ignore if profile already exists
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW 
  EXECUTE FUNCTION public.handle_new_user();

-- --------------------------------------------
-- STEP 5: ENSURE CLASS COLUMNS
-- --------------------------------------------

ALTER TABLE profiles 
  ADD COLUMN IF NOT EXISTS class_name TEXT,
  ADD COLUMN IF NOT EXISTS student_no TEXT;

CREATE INDEX IF NOT EXISTS idx_profiles_class ON profiles(class_name);

-- --------------------------------------------
-- STEP 6: GRANT SERVICE_ROLE FULL ACCESS
-- --------------------------------------------
-- This allows the backend API to access everything
-- (bypasses RLS when using service_role key)

GRANT ALL ON poll_votes TO service_role;
GRANT ALL ON profiles TO service_role;
GRANT ALL ON polls TO service_role;
GRANT ALL ON poll_options TO service_role;

-- --------------------------------------------
-- VERIFICATION
-- --------------------------------------------

-- Show all policies (should be ONLY 5 simple ones)
SELECT 
  tablename,
  policyname,
  cmd,
  roles
FROM pg_policies
WHERE tablename IN ('poll_votes', 'profiles')
ORDER BY tablename, policyname;

-- Show primary key
SELECT 
  tc.constraint_name, 
  tc.table_name, 
  kcu.column_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu 
  ON tc.constraint_name = kcu.constraint_name
WHERE tc.table_name = 'poll_votes' 
  AND tc.constraint_type = 'PRIMARY KEY';

-- ============================================
-- DONE! Now:
-- 1. Regular users: Can only see/update their own data
-- 2. Backend API (service_role): Can see EVERYTHING
-- 3. NO admin checks = NO infinite recursion!
-- ============================================
