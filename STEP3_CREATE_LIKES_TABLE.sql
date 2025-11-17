-- ============================================
-- STEP 3: Create IDEA_LIKES table and trigger
-- ============================================

CREATE TABLE IF NOT EXISTS idea_likes (
  idea_id UUID NOT NULL REFERENCES ideas(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (idea_id, user_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_idea_likes_idea ON idea_likes(idea_id);
CREATE INDEX IF NOT EXISTS idx_idea_likes_user ON idea_likes(user_id);

-- Enable RLS
ALTER TABLE idea_likes ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DROP POLICY IF EXISTS "idea_likes_select_all" ON idea_likes;
DROP POLICY IF EXISTS "idea_likes_insert_own" ON idea_likes;
DROP POLICY IF EXISTS "idea_likes_delete_own" ON idea_likes;

CREATE POLICY "idea_likes_select_all"
  ON idea_likes FOR SELECT
  USING (true);

CREATE POLICY "idea_likes_insert_own"
  ON idea_likes FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "idea_likes_delete_own"
  ON idea_likes FOR DELETE
  USING (user_id = auth.uid());

-- ============================================
-- TRIGGER: Update likes_count
-- ============================================

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

DROP TRIGGER IF EXISTS trigger_update_idea_likes_count ON idea_likes;

CREATE TRIGGER trigger_update_idea_likes_count
AFTER INSERT OR DELETE ON idea_likes
FOR EACH ROW
EXECUTE FUNCTION update_idea_likes_count();
