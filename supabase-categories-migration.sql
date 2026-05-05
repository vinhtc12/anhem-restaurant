-- =============================================
-- MIGRATION: Tạo bảng categories
-- Chạy file này trong Supabase SQL Editor
-- =============================================

CREATE TABLE IF NOT EXISTS categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public access categories" ON categories FOR ALL USING (true) WITH CHECK (true);

INSERT INTO categories (name) VALUES
  ('Đồ uống'),
  ('Gỏi'),
  ('Hải sản'),
  ('Khai vị'),
  ('Cơm & Mỳ'),
  ('Canh & Cháo'),
  ('Món ăn'),
  ('Khác')
ON CONFLICT (name) DO NOTHING;
