-- Maya Meclisi Portal - Supabase Veritabanı Kurulum
-- Bu dosyadaki tüm SQL komutlarını Supabase SQL Editor'da çalıştırın

-- ============================================
-- 1. PROFILES TABLOSU (Kullanıcı Profilleri)
-- ============================================
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  first_name TEXT,
  last_name TEXT,
  role TEXT DEFAULT 'student' CHECK (role IN ('admin', 'teacher', 'student')),
  class_name TEXT,
  student_no TEXT,
  gender TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Otomatik profil oluşturma trigger
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, role)
  VALUES (NEW.id, 'student');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER IF NOT EXISTS on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- 2. ANNOUNCEMENTS TABLOSU (Duyurular)
-- ============================================
CREATE TABLE IF NOT EXISTS announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  author_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- 3. POLLS TABLOSU (Oylamalar)
-- ============================================
CREATE TABLE IF NOT EXISTS polls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question TEXT NOT NULL,
  is_open BOOLEAN DEFAULT true,
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS poll_options (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  poll_id UUID REFERENCES polls(id) ON DELETE CASCADE NOT NULL,
  option_text TEXT NOT NULL,
  vote_count INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS poll_votes (
  poll_id UUID REFERENCES polls(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  option_id UUID REFERENCES poll_options(id) ON DELETE CASCADE,
  voted_at TIMESTAMP DEFAULT NOW(),
  PRIMARY KEY (poll_id, user_id)
);

-- ============================================
-- 4. IDEAS TABLOSU (Fikirler)
-- ============================================
CREATE TABLE IF NOT EXISTS ideas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  author_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  reviewed_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- 5. COMMENTS TABLOSU (Yorumlar - Fikirlere)
-- ============================================
CREATE TABLE IF NOT EXISTS comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  idea_id UUID REFERENCES ideas(id) ON DELETE CASCADE NOT NULL,
  author_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  reviewed_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- 6. BLÜTEN POSTS TABLOSU (Instagram İçerikler)
-- ============================================
CREATE TABLE IF NOT EXISTS bluten_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  instagram_post_id TEXT UNIQUE, -- Instagram'dan gelen post ID
  instagram_url TEXT NOT NULL,   -- Permalink
  media_url TEXT,                -- Görsel/video URL
  media_type TEXT,               -- IMAGE, VIDEO, CAROUSEL_ALBUM
  caption TEXT,                  -- Post açıklaması
  username TEXT,                 -- Instagram kullanıcı adı
  is_visible BOOLEAN DEFAULT true, -- Admin soft-delete için
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL, -- Manuel ekleyen admin
  posted_at TIMESTAMP,           -- Instagram'da paylaşım tarihi
  fetched_at TIMESTAMP DEFAULT NOW() -- Sistemimize eklenme tarihi
);

-- ============================================
-- 7. INSTAGRAM SYNC STATE (Senkronizasyon Durumu)
-- ============================================
CREATE TABLE IF NOT EXISTS instagram_sync_state (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  last_synced_post_id TEXT,      -- Son çekilen post ID
  last_sync_timestamp TIMESTAMP, -- Son senkronizasyon zamanı
  sync_enabled BOOLEAN DEFAULT false, -- Otomatik sync açık mı?
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- İlk kayıt ekle (singleton pattern)
INSERT INTO instagram_sync_state (sync_enabled) 
VALUES (false)
ON CONFLICT DO NOTHING;

-- ============================================
-- 8. ROW LEVEL SECURITY (RLS) POLİCİLERİ
-- ============================================

-- Profiles RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Herkes profilleri görebilir"
  ON profiles FOR SELECT
  USING (true);

CREATE POLICY "Kullanıcı kendi profilini güncelleyebilir"
  ON profiles FOR UPDATE
  USING (auth.uid() = user_id);

-- Announcements RLS
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Herkes duyuruları görebilir"
  ON announcements FOR SELECT
  USING (true);

CREATE POLICY "Sadece adminler duyuru ekleyebilir"
  ON announcements FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Sadece adminler duyuru silebilir"
  ON announcements FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Polls RLS
ALTER TABLE polls ENABLE ROW LEVEL SECURITY;
ALTER TABLE poll_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE poll_votes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Herkes pollları görebilir"
  ON polls FOR SELECT
  USING (true);

CREATE POLICY "Herkes poll seçeneklerini görebilir"
  ON poll_options FOR SELECT
  USING (true);

CREATE POLICY "Kullanıcılar kendi oylarını görebilir"
  ON poll_votes FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Kullanıcılar oy verebilir"
  ON poll_votes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Ideas RLS
ALTER TABLE ideas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Herkes onaylanmış fikirleri görebilir"
  ON ideas FOR SELECT
  USING (status = 'approved' OR author_id IN (
    SELECT id FROM profiles WHERE user_id = auth.uid()
  ));

CREATE POLICY "Kullanıcılar fikir gönderebilir"
  ON ideas FOR INSERT
  WITH CHECK (
    author_id IN (
      SELECT id FROM profiles WHERE user_id = auth.uid()
    )
  );

-- Comments RLS
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Herkes onaylanmış yorumları görebilir"
  ON comments FOR SELECT
  USING (status = 'approved');

CREATE POLICY "Kullanıcılar yorum yapabilir"
  ON comments FOR INSERT
  WITH CHECK (
    author_id IN (
      SELECT id FROM profiles WHERE user_id = auth.uid()
    )
  );

-- Blüten Posts RLS
ALTER TABLE bluten_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Herkes görünür postları görebilir"
  ON bluten_posts FOR SELECT
  USING (is_visible = true);

CREATE POLICY "Sadece adminler blüten ekleyebilir"
  ON bluten_posts FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Sadece adminler blüten güncelleyebilir"
  ON bluten_posts FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================
-- 9. İNDEXLER (Performans için)
-- ============================================
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_announcements_created_at ON announcements(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_polls_is_open ON polls(is_open);
CREATE INDEX IF NOT EXISTS idx_ideas_status ON ideas(status);
CREATE INDEX IF NOT EXISTS idx_ideas_author ON ideas(author_id);
CREATE INDEX IF NOT EXISTS idx_comments_idea ON comments(idea_id);
CREATE INDEX IF NOT EXISTS idx_comments_status ON comments(status);
CREATE INDEX IF NOT EXISTS idx_bluten_visible ON bluten_posts(is_visible);
CREATE INDEX IF NOT EXISTS idx_bluten_posted_at ON bluten_posts(posted_at DESC);

-- ============================================
-- KURULUM TAMAMLANDI!
-- ============================================

-- ✅ Kontrol için şu sorguları çalıştırın:
-- SELECT * FROM profiles LIMIT 5;
-- SELECT * FROM announcements LIMIT 5;
-- SELECT * FROM bluten_posts LIMIT 5;
