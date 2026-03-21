-- Clover Self-Service App Database Schema

-- Products table for coffee shop items
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  price INTEGER NOT NULL,
  category TEXT NOT NULL,
  image_url TEXT,
  available BOOLEAN DEFAULT true,
  clover_item_id TEXT,
  merchant_id TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clover_order_id TEXT,
  merchant_id TEXT NOT NULL,
  total INTEGER NOT NULL,
  tax INTEGER DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending',
  payment_method TEXT,
  device_id TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Order items junction table
CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id),
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price INTEGER NOT NULL,
  subtotal INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Allow all access policies
CREATE POLICY "products_all" ON products FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "orders_all" ON orders FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "order_items_all" ON order_items FOR ALL USING (true) WITH CHECK (true);
