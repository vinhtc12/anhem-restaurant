-- =============================================
-- SUPABASE SCHEMA - Quản lý hóa đơn quán ăn
-- Chạy file này trong Supabase SQL Editor
-- =============================================

-- Bảng món ăn
CREATE TABLE IF NOT EXISTS menu_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  price NUMERIC(10, 0) NOT NULL,
  category TEXT DEFAULT 'Khác',
  available BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Bảng hóa đơn
CREATE TABLE IF NOT EXISTS invoices (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  invoice_number TEXT UNIQUE NOT NULL,
  table_number TEXT,
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'paid', 'cancelled')),
  note TEXT,
  total NUMERIC(10, 0) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  paid_at TIMESTAMPTZ
);

-- Bảng chi tiết hóa đơn
CREATE TABLE IF NOT EXISTS invoice_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  invoice_id UUID REFERENCES invoices(id) ON DELETE CASCADE,
  menu_item_id UUID REFERENCES menu_items(id),
  menu_item_name TEXT NOT NULL,
  menu_item_price NUMERIC(10, 0) NOT NULL,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  subtotal NUMERIC(10, 0) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security (mở public access cho demo)
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_items ENABLE ROW LEVEL SECURITY;

-- Policies cho phép truy cập public (dùng cho demo - production nên dùng auth)
CREATE POLICY "Public access menu_items" ON menu_items FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public access invoices" ON invoices FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public access invoice_items" ON invoice_items FOR ALL USING (true) WITH CHECK (true);

-- Dữ liệu mẫu menu
INSERT INTO menu_items (name, price, category) VALUES
  ('Phở bò tái', 65000, 'Phở'),
  ('Phở bò chín', 65000, 'Phở'),
  ('Phở gà', 60000, 'Phở'),
  ('Bún bò Huế', 70000, 'Bún'),
  ('Bún riêu cua', 65000, 'Bún'),
  ('Cơm sườn bì chả', 55000, 'Cơm'),
  ('Cơm gà xối mỡ', 60000, 'Cơm'),
  ('Cơm tấm đặc biệt', 65000, 'Cơm'),
  ('Nước ngọt', 15000, 'Đồ uống'),
  ('Nước suối', 10000, 'Đồ uống'),
  ('Trà đá', 5000, 'Đồ uống'),
  ('Cà phê sữa đá', 25000, 'Đồ uống');
