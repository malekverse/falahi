-- 004: Last-mile sub-trips for micro-hub cross-docking

CREATE TABLE IF NOT EXISTS sub_trips (
  id                      UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  parent_trip_id          UUID NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  courier_id              UUID REFERENCES driver_profiles(id),
  delivery_zone_id        UUID REFERENCES delivery_zones(id),
  status                  TEXT NOT NULL DEFAULT 'pending'
                            CHECK (status IN (
                              'pending', 'accepted', 'in_transit',
                              'delivered', 'settled', 'disputed'
                            )),
  otp_delivery            TEXT NOT NULL,
  cargo_value_millimes    INT NOT NULL,
  driver_fee_millimes     INT NOT NULL,
  pickup_location_name    TEXT NOT NULL,
  delivery_location_name  TEXT NOT NULL,
  delivery_address        TEXT,
  order_ids               UUID[] NOT NULL DEFAULT '{}',
  accepted_at             TIMESTAMPTZ,
  delivered_at            TIMESTAMPTZ,
  settled_at              TIMESTAMPTZ,
  created_at              TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sub_trips_status ON sub_trips (status);
CREATE INDEX IF NOT EXISTS idx_sub_trips_courier ON sub_trips (courier_id);
CREATE INDEX IF NOT EXISTS idx_sub_trips_parent ON sub_trips (parent_trip_id);

ALTER TABLE sub_trips ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Couriers read available sub_trips" ON sub_trips;
CREATE POLICY "Couriers read available sub_trips"
  ON sub_trips FOR SELECT USING (
    EXISTS (SELECT 1 FROM driver_profiles WHERE id = auth.uid() AND role = 'courier')
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

DROP POLICY IF EXISTS "Couriers accept sub_trips" ON sub_trips;
CREATE POLICY "Couriers accept sub_trips"
  ON sub_trips FOR UPDATE USING (
    EXISTS (SELECT 1 FROM driver_profiles WHERE id = auth.uid() AND role = 'courier')
  );

DROP POLICY IF EXISTS "Admin manages sub_trips" ON sub_trips;
CREATE POLICY "Admin manages sub_trips"
  ON sub_trips FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE OR REPLACE FUNCTION create_sub_trips_for_hub_arrival(parent_trip_id UUID)
RETURNS JSONB
LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_parent  trips%ROWTYPE;
  v_zone    RECORD;
  v_orders  RECORD;
  v_sub_id  UUID;
BEGIN
  SELECT * INTO v_parent FROM trips WHERE id = parent_trip_id;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'parent_trip_not_found');
  END IF;

  IF v_parent.status != 'arrived_hub' THEN
    RETURN jsonb_build_object('success', false, 'error', 'parent_trip_must_be_arrived_hub');
  END IF;

  FOR v_zone IN
    SELECT dz.id AS zone_id, dz.name AS zone_name,
           jsonb_agg(to_jsonb(o.*)) AS orders
    FROM orders o
    JOIN delivery_zones dz ON dz.id = o.delivery_zone_id
    WHERE o.id = ANY(v_parent.order_ids)
      AND o.status IN ('confirmed', 'in_transit')
    GROUP BY dz.id, dz.name
  LOOP
    INSERT INTO sub_trips (
      parent_trip_id, delivery_zone_id, status, otp_delivery,
      cargo_value_millimes, driver_fee_millimes,
      pickup_location_name, delivery_location_name, delivery_address, order_ids
    ) VALUES (
      parent_trip_id, v_zone.zone_id, 'pending',
      LPAD(floor(random() * 10000)::text, 4, '0'),
      (SELECT COALESCE(SUM(total_price_millimes), 0)
       FROM orders WHERE id = ANY(
         SELECT jsonb_array_elements(v_zone.orders)->>'id'
       )::uuid[]),
      (SELECT COALESCE(SUM(total_price_millimes) * 0.08, 0)
       FROM orders WHERE id = ANY(
         SELECT jsonb_array_elements(v_zone.orders)->>'id'
       )::uuid[]),
      v_parent.destination_location_name,
      v_zone.zone_name,
      NULL,
      ARRAY(SELECT jsonb_array_elements_text(v_zone.orders->>'id'))
    )
    RETURNING id INTO v_sub_id;
  END LOOP;

  UPDATE trips SET status = 'delivered', delivered_at = NOW()
  WHERE id = parent_trip_id;

  RETURN jsonb_build_object('success', true, 'sub_trips_created', true);
END;
$$;

CREATE OR REPLACE FUNCTION accept_sub_trip(sub_trip_id UUID, courier_uuid UUID)
RETURNS JSONB
LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_sub sub_trips%ROWTYPE;
BEGIN
  SELECT * INTO v_sub FROM sub_trips WHERE id = sub_trip_id FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'sub_trip_not_found');
  END IF;

  IF v_sub.status != 'pending' THEN
    RETURN jsonb_build_object('success', false, 'error', 'already_accepted');
  END IF;

  UPDATE sub_trips SET
    status = 'accepted',
    courier_id = courier_uuid,
    accepted_at = NOW()
  WHERE id = sub_trip_id;

  RETURN jsonb_build_object('success', true);
END;
$$;

CREATE OR REPLACE FUNCTION validate_sub_trip_delivery_otp(sub_trip_id UUID, otp_input TEXT)
RETURNS JSONB
LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_sub sub_trips%ROWTYPE;
BEGIN
  SELECT * INTO v_sub FROM sub_trips WHERE id = sub_trip_id FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'sub_trip_not_found');
  END IF;

  IF v_sub.status NOT IN ('accepted', 'in_transit') THEN
    RETURN jsonb_build_object('success', false, 'error', 'invalid_status');
  END IF;

  IF v_sub.otp_delivery != otp_input THEN
    RETURN jsonb_build_object('success', false, 'error', 'invalid_otp');
  END IF;

  UPDATE sub_trips SET
    status = 'delivered',
    delivered_at = NOW()
  WHERE id = sub_trip_id;

  UPDATE orders SET status = 'delivered'
  WHERE id = ANY(v_sub.order_ids);

  RETURN jsonb_build_object('success', true);
END;
$$;

CREATE OR REPLACE FUNCTION get_available_sub_trips()
RETURNS SETOF sub_trips
LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  RETURN QUERY
  SELECT * FROM sub_trips
  WHERE status = 'pending'
  ORDER BY created_at ASC;
END;
$$;
