-- Seed data for coffee shop products
-- Using 'demo_merchant' as the merchant_id for testing

-- Coffee products
INSERT INTO products (name, description, price, category, image_url, merchant_id) VALUES
('Espresso', 'Rich and bold single shot espresso', 250, 'coffee', 'https://images.unsplash.com/photo-1510707577719-ae7c14805e3a?w=400', 'demo_merchant'),
('Americano', 'Espresso with hot water', 350, 'coffee', 'https://images.unsplash.com/photo-1532004491497-ba35c367d634?w=400', 'demo_merchant'),
('Cappuccino', 'Espresso with steamed milk and foam', 450, 'coffee', 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=400', 'demo_merchant'),
('Latte', 'Espresso with steamed milk', 475, 'coffee', 'https://images.unsplash.com/photo-1570968915860-54d5c301fa9f?w=400', 'demo_merchant'),
('Mocha', 'Espresso with chocolate and steamed milk', 525, 'coffee', 'https://images.unsplash.com/photo-1578314675249-a6910f80cc4e?w=400', 'demo_merchant'),
('Cold Brew', 'Slow-steeped cold coffee', 450, 'coffee', 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=400', 'demo_merchant');

-- Pastry products
INSERT INTO products (name, description, price, category, image_url, merchant_id) VALUES
('Croissant', 'Buttery flaky French pastry', 350, 'pastry', 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=400', 'demo_merchant'),
('Chocolate Muffin', 'Rich chocolate chip muffin', 375, 'pastry', 'https://images.unsplash.com/photo-1607958996333-41aef7caefaa?w=400', 'demo_merchant'),
('Blueberry Scone', 'Fresh blueberry scone with glaze', 395, 'pastry', 'https://images.unsplash.com/photo-1486427944544-d2c824c97eaf?w=400', 'demo_merchant'),
('Cinnamon Roll', 'Warm cinnamon roll with cream cheese frosting', 425, 'pastry', 'https://images.unsplash.com/photo-1509365465985-25d11c17e812?w=400', 'demo_merchant'),
('Almond Croissant', 'Croissant filled with almond cream', 450, 'pastry', 'https://images.unsplash.com/photo-1623334044303-241021148842?w=400', 'demo_merchant');

-- Drink products (non-coffee)
INSERT INTO products (name, description, price, category, image_url, merchant_id) VALUES
('Hot Chocolate', 'Rich and creamy hot chocolate', 400, 'drink', 'https://images.unsplash.com/photo-1517578239113-b03992dcdd25?w=400', 'demo_merchant'),
('Chai Latte', 'Spiced chai with steamed milk', 450, 'drink', 'https://images.unsplash.com/photo-1594631252845-29fc4cc8cde9?w=400', 'demo_merchant'),
('Matcha Latte', 'Premium matcha green tea latte', 525, 'drink', 'https://images.unsplash.com/photo-1515823064-d6e0c04616a7?w=400', 'demo_merchant'),
('Iced Tea', 'Refreshing house-brewed iced tea', 300, 'drink', 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400', 'demo_merchant'),
('Lemonade', 'Fresh-squeezed lemonade', 350, 'drink', 'https://images.unsplash.com/photo-1621263764928-df1444c5e859?w=400', 'demo_merchant');

-- Food products
INSERT INTO products (name, description, price, category, image_url, merchant_id) VALUES
('Avocado Toast', 'Smashed avocado on artisan bread', 850, 'food', 'https://images.unsplash.com/photo-1541519227354-08fa5d50c44d?w=400', 'demo_merchant'),
('Turkey Sandwich', 'Turkey, cheese, lettuce and tomato', 925, 'food', 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=400', 'demo_merchant'),
('Veggie Wrap', 'Fresh vegetables in a whole wheat wrap', 875, 'food', 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=400', 'demo_merchant'),
('Fruit Bowl', 'Seasonal fresh fruit selection', 650, 'food', 'https://images.unsplash.com/photo-1490474418585-ba9bad8fd0ea?w=400', 'demo_merchant'),
('Yogurt Parfait', 'Greek yogurt with granola and berries', 575, 'food', 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=400', 'demo_merchant');

-- Seed some sample orders for demo analytics
INSERT INTO orders (merchant_id, total, tax, status, payment_method, device_id, created_at) VALUES
('demo_merchant', 1275, 102, 'paid', 'card', 'station_01', now() - interval '6 hours'),
('demo_merchant', 850, 68, 'paid', 'card', 'station_01', now() - interval '5 hours'),
('demo_merchant', 2150, 172, 'paid', 'card', 'mini_01', now() - interval '4 hours'),
('demo_merchant', 525, 42, 'paid', 'card', 'station_01', now() - interval '3 hours'),
('demo_merchant', 1625, 130, 'paid', 'card', 'flex_01', now() - interval '2 hours'),
('demo_merchant', 975, 78, 'paid', 'card', 'station_01', now() - interval '1 hour'),
('demo_merchant', 1450, 116, 'paid', 'card', 'mini_01', now() - interval '30 minutes');

-- Get the order IDs for adding items (using a CTE to fetch them)
DO $$
DECLARE
  order_ids UUID[];
  product_ids UUID[];
BEGIN
  -- Get the last 7 order IDs
  SELECT array_agg(id ORDER BY created_at) INTO order_ids
  FROM (SELECT id, created_at FROM orders ORDER BY created_at DESC LIMIT 7) sub;

  -- Get some product IDs
  SELECT array_agg(id) INTO product_ids FROM products LIMIT 10;

  -- Add items to orders
  IF array_length(order_ids, 1) >= 7 AND array_length(product_ids, 1) >= 10 THEN
    -- Order 1: Cappuccino + Croissant
    INSERT INTO order_items (order_id, product_id, quantity, unit_price, subtotal)
    SELECT order_ids[1], id, 1, price, price FROM products WHERE name = 'Cappuccino';
    INSERT INTO order_items (order_id, product_id, quantity, unit_price, subtotal)
    SELECT order_ids[1], id, 1, price, price FROM products WHERE name = 'Croissant';

    -- Order 2: Avocado Toast
    INSERT INTO order_items (order_id, product_id, quantity, unit_price, subtotal)
    SELECT order_ids[2], id, 1, price, price FROM products WHERE name = 'Avocado Toast';

    -- Order 3: 2 Lattes + 2 Muffins
    INSERT INTO order_items (order_id, product_id, quantity, unit_price, subtotal)
    SELECT order_ids[3], id, 2, price, price * 2 FROM products WHERE name = 'Latte';
    INSERT INTO order_items (order_id, product_id, quantity, unit_price, subtotal)
    SELECT order_ids[3], id, 2, price, price * 2 FROM products WHERE name = 'Chocolate Muffin';

    -- Order 4: Mocha
    INSERT INTO order_items (order_id, product_id, quantity, unit_price, subtotal)
    SELECT order_ids[4], id, 1, price, price FROM products WHERE name = 'Mocha';

    -- Order 5: Turkey Sandwich + Cold Brew
    INSERT INTO order_items (order_id, product_id, quantity, unit_price, subtotal)
    SELECT order_ids[5], id, 1, price, price FROM products WHERE name = 'Turkey Sandwich';
    INSERT INTO order_items (order_id, product_id, quantity, unit_price, subtotal)
    SELECT order_ids[5], id, 1, price, price FROM products WHERE name = 'Cold Brew';

    -- Order 6: Matcha Latte + Almond Croissant
    INSERT INTO order_items (order_id, product_id, quantity, unit_price, subtotal)
    SELECT order_ids[6], id, 1, price, price FROM products WHERE name = 'Matcha Latte';
    INSERT INTO order_items (order_id, product_id, quantity, unit_price, subtotal)
    SELECT order_ids[6], id, 1, price, price FROM products WHERE name = 'Almond Croissant';

    -- Order 7: 2 Americanos + Cinnamon Roll
    INSERT INTO order_items (order_id, product_id, quantity, unit_price, subtotal)
    SELECT order_ids[7], id, 2, price, price * 2 FROM products WHERE name = 'Americano';
    INSERT INTO order_items (order_id, product_id, quantity, unit_price, subtotal)
    SELECT order_ids[7], id, 1, price, price FROM products WHERE name = 'Cinnamon Roll';
  END IF;
END $$;
