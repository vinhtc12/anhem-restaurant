-- MIGRATION: Cho phép số lượng thập phân (kg: 0.3, 0.5...)
ALTER TABLE invoice_items
  ALTER COLUMN quantity TYPE NUMERIC(10, 3),
  DROP CONSTRAINT IF EXISTS invoice_items_quantity_check,
  ADD CONSTRAINT invoice_items_quantity_check CHECK (quantity > 0);
