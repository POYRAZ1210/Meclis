-- ============================================
-- STEP 4: Create helper function to bypass schema cache
-- ============================================

-- This function bypasses Supabase PostgREST schema cache issues
CREATE OR REPLACE FUNCTION create_idea_v2(
  p_title TEXT,
  p_content TEXT,
  p_author_id UUID,
  p_image_url TEXT DEFAULT NULL,
  p_video_url TEXT DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  title TEXT,
  content TEXT,
  status TEXT,
  author_id UUID,
  image_url TEXT,
  video_url TEXT,
  likes_count INTEGER,
  reviewed_by UUID,
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_idea_id UUID;
BEGIN
  INSERT INTO ideas (
    title,
    content,
    author_id,
    status,
    image_url,
    video_url,
    likes_count
  )
  VALUES (
    p_title,
    p_content,
    p_author_id,
    'pending',
    p_image_url,
    p_video_url,
    0
  )
  RETURNING ideas.id INTO v_idea_id;

  RETURN QUERY
  SELECT 
    i.id,
    i.title,
    i.content,
    i.status,
    i.author_id,
    i.image_url,
    i.video_url,
    i.likes_count,
    i.reviewed_by,
    i.reviewed_at,
    i.created_at
  FROM ideas i
  WHERE i.id = v_idea_id;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION create_idea_v2 TO authenticated;
