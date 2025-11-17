-- ============================================
-- STEP 2: Clean create COMMENTS table
-- ============================================

-- Drop existing table and recreate fresh
DROP TABLE IF EXISTS comments CASCADE;

-- Create the table with all columns and constraints
CREATE TABLE comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  idea_id UUID NOT NULL REFERENCES ideas(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  reviewed_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_comments_idea ON comments(idea_id);
CREATE INDEX idx_comments_status ON comments(status);

-- Enable RLS
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- RLS Policies
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
