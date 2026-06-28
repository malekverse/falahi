-- Trust Tier Auto-Upgrade Logic
-- Run after 002_ratings.sql

CREATE OR REPLACE FUNCTION auto_upgrade_trust_tier()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.trust_score >= 4.0 AND NEW.total_trips >= 30 AND NEW.trust_tier < 3 THEN
    NEW.trust_tier := 3;
    NEW.max_cargo_value_tnd := 500000;
  ELSIF NEW.trust_score >= 2.5 AND NEW.total_trips >= 10 AND NEW.trust_tier < 2 THEN
    NEW.trust_tier := 2;
    NEW.max_cargo_value_tnd := 350000;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_auto_upgrade_tier
  BEFORE UPDATE OF trust_score, total_trips ON driver_profiles
  FOR EACH ROW
  EXECUTE FUNCTION auto_upgrade_trust_tier();
