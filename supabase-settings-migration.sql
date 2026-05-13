-- Migration: app_settings table + invoice_number sequence
-- Run this in Supabase SQL Editor

-- 1. Settings table (single row, enforced by PK + CHECK constraint)
CREATE TABLE IF NOT EXISTS app_settings (
  id INTEGER PRIMARY KEY DEFAULT 1,
  CONSTRAINT app_settings_single_row CHECK (id = 1),
  name TEXT NOT NULL DEFAULT 'NHÀ HÀNG HẢI SẢN ANH EM 304',
  tagline TEXT NOT NULL DEFAULT 'CHUYÊN PHỤC VỤ CÁC MÓN HẢI SẢN BIỂN TƯƠI SỐNG',
  phones TEXT NOT NULL DEFAULT '0947794868 - 0985899636',
  bank_owner TEXT NOT NULL DEFAULT 'TRAN MINH MANH',
  bank_account TEXT NOT NULL DEFAULT '3601888678789',
  bank_id TEXT NOT NULL DEFAULT '970405',
  bank_name TEXT NOT NULL DEFAULT 'Agribank',
  thank_you TEXT NOT NULL DEFAULT 'Cảm ơn quý khách và hẹn gặp lại !!!',
  qr_code TEXT NOT NULL DEFAULT '',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default row (no-op if already exists)
INSERT INTO app_settings (id) VALUES (1) ON CONFLICT DO NOTHING;

-- 2. Fix duplicate invoice_number race condition with an atomic sequence
--    Replaces the old "read last + increment" approach in application code.
CREATE SEQUENCE IF NOT EXISTS invoice_number_seq;

-- Initialize sequence from the current max invoice number so numbering continues
SELECT setval(
  'invoice_number_seq',
  COALESCE(
    (SELECT MAX(CAST(REPLACE(invoice_number, 'HD', '') AS INTEGER))
     FROM invoices WHERE invoice_number ~ '^HD[0-9]+$'),
    0
  )
);

-- Function called via supabase.rpc('next_invoice_number')
CREATE OR REPLACE FUNCTION next_invoice_number()
RETURNS TEXT LANGUAGE SQL SECURITY DEFINER AS $$
  SELECT 'HD' || LPAD(nextval('invoice_number_seq')::TEXT, 6, '0');
$$;
