-- =============================================
-- MIGRATION: Thêm cột unit + import menu thực tế
-- Chạy file này trong Supabase SQL Editor
-- LƯU Ý: Sẽ xoá toàn bộ menu cũ (kể cả dữ liệu mẫu)
-- =============================================

-- 1. Thêm cột đơn vị tính
ALTER TABLE menu_items ADD COLUMN IF NOT EXISTS unit TEXT DEFAULT '';

-- 2. Xoá dữ liệu cũ (đúng thứ tự FK)
DELETE FROM invoice_items;
DELETE FROM invoices;
DELETE FROM menu_items;

-- 3. Import toàn bộ thực đơn
INSERT INTO menu_items (name, price, category, unit, available) VALUES

-- ĐỒ UỐNG
('Bia sài gòn',              16000,  'Đồ uống',    'lon',   true),
('Bia Tiger xanh lùn',       16000,  'Đồ uống',    'lon',   true),
('Bia Heineken lùn',         20000,  'Đồ uống',    'lon',   true),
('Bia Tiger bạc lùn',        18000,  'Đồ uống',    'lon',   true),
('Nước lọc',                 10000,  'Đồ uống',    'chai',  true),
('Rượu chuối hột',           60000,  'Đồ uống',    'chai',  true),
('Nước ngọt',                15000,  'Đồ uống',    'lon',   true),

-- GỎI
('Gỏi Tôm',                 250000,  'Gỏi',       'đĩa',   true),
('Gỏi cá trích',            250000,  'Gỏi',       'đĩa',   true),
('Gỏi cá kìm',              250000,  'Gỏi',       'đĩa',   true),
('Gỏi cá mú',               650000,  'Gỏi',       'kg',    true),
('Nộm củ dừa',              130000,  'Gỏi',       'đĩa',   true),

-- HẢI SẢN
('Mực hấp sả',              270000,  'Hải sản',   'đĩa',   true),
('Mực chiên bơ',            250000,  'Hải sản',   'đĩa',   true),
('Mực sim xôi',             300000,  'Hải sản',   'đĩa',   true),
('Mực trứng hấp sả',        350000,  'Hải sản',   'đĩa',   true),
('Mực khô',                      0,  'Hải sản',   'đĩa',   true),
('Mực một nắng',                 0,  'Hải sản',   'đĩa',   true),
('Mực lá',                       0,  'Hải sản',   'đĩa',   true),
('Mực xào hành tây',        250000,  'Hải sản',   'đĩa',   true),
('Ghẹ',                          0,  'Hải sản',   'kg',    true),
('Hàu nướng mỡ hành',        20000,  'Hải sản',   'con',   true),
('Hàu nướng Phomai',         25000,  'Hải sản',   'con',   true),
('Hàu sống',                 20000,  'Hải sản',   'con',   true),
('Xúp hàu',                 150000,  'Hải sản',   'tô',    true),
('Bạch tuộc hấp sả',        220000,  'Hải sản',   'đĩa',   true),
('Bạch tuộc nướng mọi',     220000,  'Hải sản',   'đĩa',   true),
('Bạch tuộc nướng sate',    220000,  'Hải sản',   'đĩa',   true),
('Cá chim nướng',           400000,  'Hải sản',   'kg',    true),
('Cá chình nướng',          650000,  'Hải sản',   'kg',    true),
('Cá dìa nướng',            400000,  'Hải sản',   'kg',    true),
('Cá Đuối nấu chua',        200000,  'Hải sản',   'tô',    true),
('Cá kìm nướng',            180000,  'Hải sản',   'đĩa',   true),
('Cá mú xì dầu',            600000,  'Hải sản',   'kg',    true),
('Cá trích nướng',          150000,  'Hải sản',   'đĩa',   true),
('Cá vược xì dầu',          350000,  'Hải sản',   'kg',    true),
('Cá Thu sốt cà chua',      180000,  'Hải sản',   'đĩa',   true),
('Đầu đuôi cá Thu nướng',        0,  'Hải sản',   'đĩa',   true),
('Chân mai chiên',          200000,  'Hải sản',   'đĩa',   true),
('Chíp chíp',                    0,  'Hải sản',   'tô',    true),
('Cua gạch',                     0,  'Hải sản',   'kg',    true),
('Cua thịt',                     0,  'Hải sản',   'kg',    true),
('Gà chiên mắm',            180000,  'Hải sản',   'đĩa',   true),
('Gà rang muối',            180000,  'Hải sản',   'đĩa',   true),
('Ngao hấp lá lốt',         180000,  'Hải sản',   'tô',    true),
('Ngao hấp thái',           180000,  'Hải sản',   'tô',    true),
('Ngao mật',                     0,  'Hải sản',   'tô',    true),
('Nộm cá mai',              180000,  'Hải sản',   'đĩa',   true),
('Nộm sứa',                 100000,  'Hải sản',   'đĩa',   true),
('Ốc hương biển hấp sả',    360000,  'Hải sản',   'đĩa',   true),
('Ốc hương biển bơ tỏi + bánh mỳ',  380000, 'Hải sản', 'đĩa', true),
('Ốc hương biển trứng muối + bánh mỳ', 380000, 'Hải sản', 'đĩa', true),
('Ốc mỡ hấp sả',            200000,  'Hải sản',   'đĩa',   true),
('Ốc xoắn xào',             150000,  'Hải sản',   'tô',    true),
('Tôm nướng',               250000,  'Hải sản',   'đĩa',   true),
('Tôm hấp sả',              250000,  'Hải sản',   'đĩa',   true),
('Tôm rang me/ bơ tỏi',     250000,  'Hải sản',   'đĩa',   true),
('Tôm Hùm',                      0,  'Hải sản',   'kg',    true),
('Tôm càng xanh',                0,  'Hải sản',   'kg',    true),
('Tôm tít hấp sả',          250000,  'Hải sản',   'đĩa',   true),
('Tôm tít rang me',         250000,  'Hải sản',   'đĩa',   true),
('Tôm rim thịt',            200000,  'Hải sản',   'đĩa',   true),
('Sứa ngâm mắm nhỉ',        150000,  'Hải sản',   'tô',    true),
('Hến xúc bánh đa',         150000,  'Hải sản',   'đĩa',   true),
('Lươn om chuối đậu',       200000,  'Hải sản',   'tô',    true),
('Lươn xào sả ớt',          200000,  'Hải sản',   'đĩa',   true),
('Cá mai khô chiên',        100000,  'Hải sản',   'đĩa',   true),
('Nem hải sản chiên',       200000,  'Hải sản',   'đĩa',   true),

-- KHAI VỊ
('Lạc sấy',                  15000,  'Khai vị',   'gói',   true),
('Khoai tây chiên',          50000,  'Khai vị',   'đĩa',   true),
('Cá bống biển chiên giòn', 200000,  'Khai vị',   'đĩa',   true),
('Cá đục nướng/ chiên giòn',200000,  'Khai vị',   'đĩa',   true),
('Ram tôm chiên',           150000,  'Khai vị',   'đĩa',   true),
('Bánh đa',                  15000,  'Khai vị',   'gói',   true),
('Phồng tôm',                20000,  'Khai vị',   'đĩa',   true),
('Chả cuốn',                160000,  'Khai vị',   'đĩa',   true),
('Ngô chiên bơ',             50000,  'Khai vị',   'đĩa',   true),

-- CƠM & MỲ
('Cơm chiên hải sản',       120000,  'Cơm & Mỳ',  'đĩa',   true),
('Mỳ xào hải sản',          150000,  'Cơm & Mỳ',  'đĩa',   true),
('Cơm + cà',                 30000,  'Cơm & Mỳ',  'suất',  true),
('Cơm rang trứng',           50000,  'Cơm & Mỳ',  'đĩa',   true),
('Mỳ xào trứng',             50000,  'Cơm & Mỳ',  'đĩa',   true),
('Xôi',                          0,  'Cơm & Mỳ',  'đĩa',   true),
('Suất ăn',                      0,  'Cơm & Mỳ',  'suất',  true),

-- CANH & CHÁO
('Cháo Nghêu',               60000,  'Canh & Cháo','tô',    true),
('Canh ngao chua',           50000,  'Canh & Cháo','tô',    true),
('Canh cua đồng',            50000,  'Canh & Cháo','tô',    true),
('Canh rau vặt',                 0,  'Canh & Cháo','tô',    true),

-- MÓN ĂN
('Thịt rang cháy cạnh',     160000,  'Món ăn',    'đĩa',   true),
('Rau muống xào tỏi',        50000,  'Món ăn',    'đĩa',   true),
('Trứng rán',                50000,  'Món ăn',    'đĩa',   true),
('Sườn chua ngọt',          180000,  'Món ăn',    'đĩa',   true),
('Rau khoai xào',            50000,  'Món ăn',    'đĩa',   true),
('Đậu lướt/ tẩm hành',       50000,  'Món ăn',    'đĩa',   true),
('Rau cải xào',                  0,  'Món ăn',    'đĩa',   true),
('Bắp cải luộc',                 0,  'Món ăn',    'đĩa',   true),

-- KHÁC
('Thu hộ',                       0,  'Khác',      'lần',   true),
('Công chế biến',                0,  'Khác',      'lần',   true);
