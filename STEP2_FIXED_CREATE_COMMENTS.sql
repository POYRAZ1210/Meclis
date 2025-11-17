-- ============================================
-- STEP 2: Create COMMENTS table (FIXED)
-- ============================================

-- First, create the table
CREATE TABLE IF NOT EXISTS comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  idea_id UUID NOT NULL,
  author_id UUID NOT NULL,
  content TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  reviewed_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add foreign keys separately
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'comments_idea_id_fkey'
  ) THEN
    ALTER TABLE comments 
    ADD CONSTRAINT comments_idea_id_fkey 
    FOREIGN KEY (idea_id) REFERENCES ideas(id) ON DELETE CASCADE;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'comments_author_id_fkey'
  ) THEN
    ALTER TABLE comments 
    ADD CONSTRAINT comments_author_id_fkey 
    FOREIGN KEY (author_id) REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'comments_reviewed_by_fkey'
  ) THEN
    ALTER TABLE comments 
    ADD CONSTRAINT comments_reviewed_by_fkey 
    FOREIGN KEY (reviewed_by) REFERENCES auth.users(id);
  END IF;
END $$;

-- Add check constraint
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'comments_status_check'
  ) THEN
    ALTER TABLE comments 
    ADD CONSTRAINT comments_status_check 
    CHECK (status IN ('pending', 'approved', 'rejected'));
  END IF;
END $$;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_comments_idea ON comments(idea_id);
CREATE INDEX IF NOT EXISTS idx_comments_status ON comments(status);

-- Enable RLS
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DROP POLICY IF EXISTS "comments_select_approved" ON comments;
DROP POLICY IF EXISTS "comments_insert_own" ON comments;
DROP POLICY IF EXISTS "comments_update_own" ON comments;
DROP POLICY IF EXISTS "comments_delete_own" ON comments;

CREATE POLICY "comments_select_approved"
  ON comments FOR SELECT
  USING (status = 'approved' OR author_id = auth.uid());

CREATE POLICY "comments_insert_own"
  ON comments FOR INSERT
  WITH CHECK (author_id = auth.uid());

CREATE POLICY "comments_update_own"
  ON comments FOR UPDATE
  USING (author_id = auth.uid() AND status = 'pending');

CREATE POLICY "comments_delete_own"
  ON comments FOR DELETE
  USING (author_id = auth.uid() AND status = 'pending');
