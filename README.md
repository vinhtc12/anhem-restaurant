# 🍜 Quản Lý Hóa Đơn Quán Ăn

Web app quản lý hóa đơn bán hàng cho quán ăn, xây dựng bằng React + Supabase, deploy trên Vercel.

## Tính năng

- ✅ Tạo hóa đơn — chọn món, nhập số lượng, tính tổng tự động
- ✅ Quản lý hóa đơn — xem danh sách, lọc theo trạng thái, thanh toán / huỷ
- ✅ Quản lý món ăn — thêm, sửa, xoá, bật/tắt phục vụ
- ✅ Thống kê nhanh — tổng hóa đơn, doanh thu

---

## Cài đặt

### 1. Tạo Supabase project

1. Vào [supabase.com](https://supabase.com) → Tạo project mới
2. Vào **SQL Editor** → dán nội dung file `supabase-schema.sql` → **Run**
3. Lấy thông tin từ **Settings > API**:
   - `Project URL`
   - `anon public` key

### 2. Clone & cài đặt

```bash
git clone <your-repo>
cd restaurant-invoice-app
npm install
```

### 3. Tạo file `.env`

```bash
cp .env.example .env
```

Điền vào:
```
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
```

### 4. Chạy local

```bash
npm run dev
```

---

## Deploy lên Vercel

1. Push code lên GitHub
2. Vào [vercel.com](https://vercel.com) → **New Project** → Import repo
3. Vào **Settings > Environment Variables**, thêm:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
4. **Deploy** 🚀

---

## Stack

- **Frontend**: React 18 + React Router 6 + Vite
- **Backend / DB**: Supabase (PostgreSQL)
- **Hosting**: Vercel
- **Fonts**: Be Vietnam Pro + Playfair Display
