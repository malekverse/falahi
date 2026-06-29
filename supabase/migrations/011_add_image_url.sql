ALTER TABLE inventory_items
  ADD COLUMN image_url TEXT;

-- Grant access for RLS (existing policies cover this column)
