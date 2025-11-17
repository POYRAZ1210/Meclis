-- ============================================
-- PROFILES TABLOSUNA SINIF VE NUMARA EKLEYİN
-- ============================================

-- Eğer kolonlar yoksa ekle
ALTER TABLE profiles 
  ADD COLUMN IF NOT EXISTS class_name TEXT,
  ADD COLUMN IF NOT EXISTS student_no TEXT;

-- Index ekle (performans için)
CREATE INDEX IF NOT EXISTS idx_profiles_class ON profiles(class_name);

-- Örnek sınıflar için constraint (opsiyonel - istersen kaldırabilirsin)
-- ALTER TABLE profiles 
--   ADD CONSTRAINT valid_class CHECK (
--     class_name IS NULL OR 
--     class_name ~ '^(9|10|11|12)-[A-Z]$'
--   );

COMMENT ON COLUMN profiles.class_name IS 'Öğrenci sınıfı (örn: 9-A, 10-B)';
COMMENT ON COLUMN profiles.student_no IS 'Öğrenci numarası';
