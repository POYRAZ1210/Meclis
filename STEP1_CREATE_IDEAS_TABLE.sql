-- ============================================
-- STEP 1: Create IDEAS table
-- ============================================

CREATE TABLE IF NOT EXISTS ideas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  author_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  image_url TEXT,
  video_url TEXT,
  likes_count INTEGER NOT NULL DEFAULT 0,
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_ideas_status ON ideas(status);
CREATE INDEX IF NOT EXISTS idx_ideas_author ON ideas(author_id);
CREATE INDEX IF NOT EXISTS idx_ideas_created ON ideas(created_at DESC);

-- Enable RLS
ALTER TABLE ideas ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DROP POLICY IF EXISTS "ideas_select_approved" ON ideas;
DROP POLICY IF EXISTS "ideas_insert_own" ON ideas;
DROP POLICY IF EXISTS "ideas_update_own" ON ideas;
DROP POLICY IF EXISTS "ideas_delete_own" ON ideas;

CREATE POLICY "ideas_select_approved"
  ON ideas FOR SELECT
  USING (status = 'approved' OR author_id = auth.uid());

CREATE POLICY "ideas_insert_own"
  ON ideas FOR INSERT
  WITH CHECK (author_id = auth.uid());

CREATE POLICY "ideas_update_own"
  ON ideas FOR UPDATE
  USING (author_id = auth.uid() AND status = 'pending');

CREATE POLICY "ideas_delete_own"
  ON ideas FOR DELETE
  USING (author_id = auth.uid() AND status = 'pending');
