-- ============================================
-- IDEAS SYSTEM: Fikir, Yorum, Beğeni Tabloları
-- ============================================

-- Ideas table (if not exists, or alter if exists)
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

-- If ideas table already exists without new columns, add them
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='ideas' AND column_name='image_url') THEN
    ALTER TABLE ideas ADD COLUMN image_url TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='ideas' AND column_name='video_url') THEN
    ALTER TABLE ideas ADD COLUMN video_url TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='ideas' AND column_name='likes_count') THEN
    ALTER TABLE ideas ADD COLUMN likes_count INTEGER NOT NULL DEFAULT 0;
  END IF;
END $$;

-- Comments table (if not exists, or alter if exists)
CREATE TABLE IF NOT EXISTS comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  idea_id UUID NOT NULL REFERENCES ideas(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  reviewed_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Idea likes table
CREATE TABLE IF NOT EXISTS idea_likes (
  idea_id UUID NOT NULL REFERENCES ideas(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (idea_id, user_id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_ideas_status ON ideas(status);
CREATE INDEX IF NOT EXISTS idx_ideas_author ON ideas(author_id);
CREATE INDEX IF NOT EXISTS idx_ideas_created ON ideas(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_comments_idea ON comments(idea_id);
CREATE INDEX IF NOT EXISTS idx_comments_status ON comments(status);
CREATE INDEX IF NOT EXISTS idx_idea_likes_idea ON idea_likes(idea_id);
CREATE INDEX IF NOT EXISTS idx_idea_likes_user ON idea_likes(user_id);

-- ============================================
-- RLS POLICIES
-- ============================================

-- Enable RLS
ALTER TABLE ideas ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE idea_likes ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "ideas_select_approved" ON ideas;
DROP POLICY IF EXISTS "ideas_insert_own" ON ideas;
DROP POLICY IF EXISTS "ideas_update_own" ON ideas;
DROP POLICY IF EXISTS "ideas_delete_own" ON ideas;

DROP POLICY IF EXISTS "comments_select_approved" ON comments;
DROP POLICY IF EXISTS "comments_insert_own" ON comments;
DROP POLICY IF EXISTS "comments_update_own" ON comments;
DROP POLICY IF EXISTS "comments_delete_own" ON comments;

DROP POLICY IF EXISTS "idea_likes_select_all" ON idea_likes;
DROP POLICY IF EXISTS "idea_likes_insert_own" ON idea_likes;
DROP POLICY IF EXISTS "idea_likes_delete_own" ON idea_likes;

-- IDEAS POLICIES
-- Everyone can see approved ideas
CREATE POLICY "ideas_select_approved"
  ON ideas FOR SELECT
  USING (status = 'approved' OR author_id = auth.uid());

-- Users can insert their own ideas
CREATE POLICY "ideas_insert_own"
  ON ideas FOR INSERT
  WITH CHECK (author_id = auth.uid());

-- Users can update their own pending ideas
CREATE POLICY "ideas_update_own"
  ON ideas FOR UPDATE
  USING (author_id = auth.uid() AND status = 'pending');

-- Users can delete their own pending ideas
CREATE POLICY "ideas_delete_own"
  ON ideas FOR DELETE
  USING (author_id = auth.uid() AND status = 'pending');

-- COMMENTS POLICIES
-- Everyone can see approved comments
CREATE POLICY "comments_select_approved"
  ON comments FOR SELECT
  USING (status = 'approved' OR author_id = auth.uid());

-- Users can insert their own comments
CREATE POLICY "comments_insert_own"
  ON comments FOR INSERT
  WITH CHECK (author_id = auth.uid());

-- Users can update their own pending comments
CREATE POLICY "comments_update_own"
  ON comments FOR UPDATE
  USING (author_id = auth.uid() AND status = 'pending');

-- Users can delete their own pending comments
CREATE POLICY "comments_delete_own"
  ON comments FOR DELETE
  USING (author_id = auth.uid() AND status = 'pending');

-- IDEA_LIKES POLICIES
-- Everyone can see all likes
CREATE POLICY "idea_likes_select_all"
  ON idea_likes FOR SELECT
  USING (true);

-- Users can like ideas
CREATE POLICY "idea_likes_insert_own"
  ON idea_likes FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Users can unlike their own likes
CREATE POLICY "idea_likes_delete_own"
  ON idea_likes FOR DELETE
  USING (user_id = auth.uid());

-- ============================================
-- TRIGGER: Update likes_count on idea_likes changes
-- ============================================

-- Function to update likes count
CREATE OR REPLACE FUNCTION update_idea_likes_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE ideas 
    SET likes_count = likes_count + 1 
    WHERE id = NEW.idea_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE ideas 
    SET likes_count = likes_count - 1 
    WHERE id = OLD.idea_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Drop trigger if exists
DROP TRIGGER IF EXISTS trigger_update_idea_likes_count ON idea_likes;

-- Create trigger
CREATE TRIGGER trigger_update_idea_likes_count
AFTER INSERT OR DELETE ON idea_likes
FOR EACH ROW
EXECUTE FUNCTION update_idea_likes_count();

-- ============================================
-- DONE!
-- ============================================
