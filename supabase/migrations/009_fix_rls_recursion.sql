-- 009: Fix RLS infinite recursion — SECURITY DEFINER helpers in public schema

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER
AS $$
  SELECT EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin');
$$;

CREATE OR REPLACE FUNCTION public.has_driver_role(required_role TEXT)
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER
AS $$
  SELECT EXISTS (SELECT 1 FROM public.driver_profiles WHERE id = auth.uid() AND role = required_role);
$$;

CREATE OR REPLACE FUNCTION public.has_role(required_role TEXT)
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER
AS $$
  SELECT EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = required_role);
$$;

-- Fix profiles policies
DROP POLICY IF EXISTS "Admin reads all profiles" ON profiles;
CREATE POLICY "Admin reads all profiles"
  ON profiles FOR SELECT USING (public.is_admin());

-- Fix driver_profiles policies
DROP POLICY IF EXISTS "Admin manages driver profiles" ON driver_profiles;
CREATE POLICY "Admin manages driver profiles"
  ON driver_profiles FOR ALL USING (public.is_admin());

-- Fix inventory_items policies
DROP POLICY IF EXISTS "Admin manages all inventory" ON inventory_items;
CREATE POLICY "Admin manages all inventory"
  ON inventory_items FOR ALL USING (public.is_admin());

-- Fix orders policies
DROP POLICY IF EXISTS "Admin reads all orders" ON orders;
CREATE POLICY "Admin reads all orders"
  ON orders FOR ALL USING (public.is_admin());

-- Fix trips policies
DROP POLICY IF EXISTS "Admin manages all trips" ON trips;
CREATE POLICY "Admin manages all trips"
  ON trips FOR ALL USING (public.is_admin());

-- Fix disputes policies
DROP POLICY IF EXISTS "Admin manages disputes" ON disputes;
CREATE POLICY "Admin manages disputes"
  ON disputes FOR ALL USING (public.is_admin());

-- Fix ledger_entries policies
DROP POLICY IF EXISTS "Admin reads ledger" ON ledger_entries;
CREATE POLICY "Admin reads ledger"
  ON ledger_entries FOR SELECT USING (public.is_admin());

-- Fix ratings policies
DROP POLICY IF EXISTS "Admin manages ratings" ON ratings;
CREATE POLICY "Admin manages ratings"
  ON ratings FOR ALL USING (public.is_admin());

-- Fix sub_trips policies
DROP POLICY IF EXISTS "Couriers read available sub_trips" ON sub_trips;
CREATE POLICY "Couriers read available sub_trips"
  ON sub_trips FOR SELECT USING (public.has_driver_role('courier') OR public.is_admin());

DROP POLICY IF EXISTS "Couriers accept sub_trips" ON sub_trips;
CREATE POLICY "Couriers accept sub_trips"
  ON sub_trips FOR UPDATE USING (public.has_driver_role('courier'));

DROP POLICY IF EXISTS "Admin manages sub_trips" ON sub_trips;
CREATE POLICY "Admin manages sub_trips"
  ON sub_trips FOR ALL USING (public.is_admin());

-- Fix group_buys policies
DROP POLICY IF EXISTS "Anyone can read open group buys" ON group_buys;
CREATE POLICY "Anyone can read open group buys"
  ON group_buys FOR SELECT USING (status = 'open' OR public.is_admin() OR creator_id = auth.uid());

DROP POLICY IF EXISTS "Authenticated users can create group buys" ON group_buys;
CREATE POLICY "Authenticated users can create group buys"
  ON group_buys FOR INSERT WITH CHECK (public.has_role('buyer'));

DROP POLICY IF EXISTS "Creator or admin can update group buys" ON group_buys;
CREATE POLICY "Creator or admin can update group buys"
  ON group_buys FOR UPDATE USING (creator_id = auth.uid() OR public.is_admin());
