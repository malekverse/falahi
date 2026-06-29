-- 010: Add missing DB indexes for common query patterns

-- orders: filtering by buyer and recurring status
CREATE INDEX IF NOT EXISTS idx_orders_buyer ON orders (buyer_id);
CREATE INDEX IF NOT EXISTS idx_orders_buyer_recurring ON orders (buyer_id) WHERE is_recurring = true;
CREATE INDEX IF NOT EXISTS idx_orders_next_recurrence ON orders (next_recurrence_at) WHERE next_recurrence_at IS NOT NULL;

-- order_items: lookup by order
CREATE INDEX IF NOT EXISTS idx_order_items_inventory ON order_items (inventory_item_id);

-- disputes: lookup by trip and status
CREATE INDEX IF NOT EXISTS idx_disputes_trip ON disputes (trip_id);
CREATE INDEX IF NOT EXISTS idx_disputes_status ON disputes (status);

-- ledger_entries: filter by party and type
CREATE INDEX IF NOT EXISTS idx_ledger_party ON ledger_entries (party_id);
CREATE INDEX IF NOT EXISTS idx_ledger_trip ON ledger_entries (trip_id);
CREATE INDEX IF NOT EXISTS idx_ledger_order ON ledger_entries (order_id);

-- group_buy_participants: lookup by buyer
CREATE INDEX IF NOT EXISTS idx_gbp_buyer ON group_buy_participants (buyer_id);

-- sub_trips: find by courier
CREATE INDEX IF NOT EXISTS idx_sub_trips_courier_active ON sub_trips (courier_id) WHERE status IN ('accepted', 'in_transit');

-- profiles: lookup by phone (used in WhatsApp flow)
CREATE INDEX IF NOT EXISTS idx_profiles_phone ON profiles (phone_number);
CREATE INDEX IF NOT EXISTS idx_profiles_whatsapp ON profiles (whatsapp_id);

-- whatsapp_messages: lookup by sender
CREATE INDEX IF NOT EXISTS idx_wa_sender ON whatsapp_messages (wa_sender_id);

-- inventory_items: search by farmer + status (admin listing filter)
CREATE INDEX IF NOT EXISTS idx_inventory_farmer_status ON inventory_items (farmer_id, status);

-- trip_location_cache: cleanup query
CREATE INDEX IF NOT EXISTS idx_location_cache_synced ON trip_location_cache (synced_at);
