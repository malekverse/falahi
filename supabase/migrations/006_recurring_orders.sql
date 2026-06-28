-- 006: Recurring B2B orders processing

ALTER TABLE orders ADD COLUMN IF NOT EXISTS original_order_id UUID REFERENCES orders(id);

CREATE OR REPLACE FUNCTION process_recurring_orders()
RETURNS TABLE(order_id UUID, buyer_id UUID, total_millimes INT)
LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_order RECORD;
  v_new_order_id UUID;
BEGIN
  FOR v_order IN
    SELECT o.*
    FROM orders o
    WHERE o.is_recurring = true
      AND o.status = 'delivered'
      AND o.next_recurrence_at IS NOT NULL
      AND o.next_recurrence_at <= NOW()
  LOOP
    INSERT INTO orders (
      buyer_id, status, total_price_millimes, commission_millimes,
      delivery_zone_id, delivery_address, delivery_notes,
      is_recurring, recurrence_day, recurrence_interval,
      next_recurrence_at, original_order_id
    ) VALUES (
      v_order.buyer_id, 'pending', v_order.total_price_millimes, v_order.commission_millimes,
      v_order.delivery_zone_id, v_order.delivery_address, v_order.delivery_notes,
      true, v_order.recurrence_day, v_order.recurrence_interval,
      CASE
        WHEN v_order.recurrence_interval = 'weekly' THEN v_order.next_recurrence_at + INTERVAL '7 days'
        WHEN v_order.recurrence_interval = 'biweekly' THEN v_order.next_recurrence_at + INTERVAL '14 days'
        WHEN v_order.recurrence_interval = 'monthly' THEN v_order.next_recurrence_at + INTERVAL '1 month'
        ELSE NULL
      END,
      v_order.id
    )
    RETURNING id INTO v_new_order_id;

    INSERT INTO order_items (order_id, inventory_item_id, quantity, unit_price_millimes, total_millimes)
    SELECT v_new_order_id, oi.inventory_item_id, oi.quantity, oi.unit_price_millimes, oi.total_millimes
    FROM order_items oi
    WHERE oi.order_id = v_order.id;

    order_id := v_new_order_id;
    buyer_id := v_order.buyer_id;
    total_millimes := v_order.total_price_millimes;
    RETURN NEXT;
  END LOOP;
END;
$$;
