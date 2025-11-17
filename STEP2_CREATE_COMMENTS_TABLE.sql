-- ============================================
-- STEP 2: Create COMMENTS table
-- ============================================

CREATE TABLE IF NOT EXISTS comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  idea_id UUID NOT NULL REFERENCES ideas(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  reviewed_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

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
