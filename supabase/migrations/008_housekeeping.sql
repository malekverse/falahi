-- 007: Scheduled housekeeping functions (pg_cron)

CREATE OR REPLACE FUNCTION expire_stale_listings()
RETURNS INT
LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_count INT;
BEGIN
  UPDATE inventory_items
  SET status = 'expired'
  WHERE status = 'available'
    AND expires_at IS NOT NULL
    AND expires_at < NOW();
  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count;
END;
$$;

CREATE OR REPLACE FUNCTION alert_stale_trips()
RETURNS TABLE(trip_id UUID, driver_name TEXT, minutes_stale INT)
LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  RETURN QUERY
  SELECT
    t.id,
    COALESCE(dp.name, 'unknown'),
    EXTRACT(EPOCH FROM (NOW() - t.last_ping_at))::INT / 60
  FROM trips t
  LEFT JOIN driver_profiles dp ON dp.id = t.driver_id
  WHERE t.status IN ('accepted', 'in_transit')
    AND t.last_ping_at IS NOT NULL
    AND t.last_ping_at < NOW() - INTERVAL '10 minutes'
  ORDER BY t.last_ping_at;
END;
$$;
